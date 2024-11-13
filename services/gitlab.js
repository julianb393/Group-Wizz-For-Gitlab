
const GRAPHQL_GROUP_MEMBERS_QUERY = `groupMembers {
      nodes {
        user {
          id
          username
          name
          avatarUrl
          webPath
          assignedMergeRequests(state: opened, sort: UPDATED_DESC) {
            nodes {
              id
              title
              webPath
              updatedAt
              project {
                path
              }
              createdAt
              author {
                id
                username
                name
                avatarUrl
                webPath
              }
              updatedAt
              reviewers {
                nodes {
                  id
                  username
                  name
                  avatarUrl
                  webPath
                }
              }
            }
          }
        }
      }
    }
`.replaceAll("\n", "")

const GRAPHQL_COUNT_MRS_QUERY = `groupMembers {
      nodes {
        user {
          assignedMergeRequests(state: opened) {
            count
          }
        }
      }
    }
`.replaceAll("\n", "")

const GITLAB_GRAPHQL_ENDPOINT = "api/graphql"

async function getUserToAllMergeRequests(hostname, groupFullPath) {

  const query = `query { group(fullPath: "${groupFullPath}") { ${GRAPHQL_GROUP_MEMBERS_QUERY} } }`

  const response = await fetch(`https://${hostname}/${GITLAB_GRAPHQL_ENDPOINT}?query=${query}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })

  const assignedUsers = new Users(await response.json())
  return assignedUsers
}

async function getMergeRequestCountForGroupMembers(hostname, groupFullPath) {
  let count = 0

  const query = `query { group(fullPath: "${groupFullPath}") { ${GRAPHQL_COUNT_MRS_QUERY} } }`

  const response = await fetch(`https://${hostname}/${GITLAB_GRAPHQL_ENDPOINT}?query=${query}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })

  await response.json().then(json => json.data.group.groupMembers.nodes.forEach(node => count += node.user.assignedMergeRequests.count))
  return count
}