const GRAPHQL_GROUP_MEMBERS_QUERY = `groupMembers {
      nodes {
        user {
          id
          username
          name
          avatarUrl
          webPath
          assignedMergeRequests(state: opened) {
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
              closedAt
              milestone{
                dueDate
                title
              }
              upvotes
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

const HOSTNAME = getHostname()

const GROUP_FULL_PATH = parseGroupFullPath(document.getElementsByClassName("gl-breadcrumb-item")[0].firstElementChild.href)

function getHostname() {
  const metaUrl = document.head.querySelector("[content^='https://'][content*='gitlab'][content*='/groups']") ?? null
  return (metaUrl?.content.split("https://")[1]).split("/groups")[0]
}

function parseGroupFullPath(url) {
  const index = url.lastIndexOf("/")
  return url.substring(index + 1);
}

async function getUserToAllMergeRequests(params = {}) {

  const query = `query { group(fullPath: "${GROUP_FULL_PATH}") { ${GRAPHQL_GROUP_MEMBERS_QUERY} } }`

  const response = await fetch(`https://${HOSTNAME}/${GITLAB_GRAPHQL_ENDPOINT}?query=${query}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })

  const assignedUsers = new Users(await response.json())
  return assignedUsers
}

async function getMergeRequestCountForGroupMembers() {
  let count = 0

  const query = `query { group(fullPath: "${GROUP_FULL_PATH}") { ${GRAPHQL_COUNT_MRS_QUERY} } }`

  const response = await fetch(`https://${HOSTNAME}/${GITLAB_GRAPHQL_ENDPOINT}?query=${query}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })

  await response.json().then(json => json.data.group.groupMembers.nodes.forEach(node => count += node.user.assignedMergeRequests.count))
  return count
}