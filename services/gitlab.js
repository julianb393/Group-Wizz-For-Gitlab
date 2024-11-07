
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

const Q2 = "query { currentUser { name } }";

const GITLAB_GRAPHQL_ENDPOINT = "api/graphql"

async function getUserToAllMergeRequests(groupFullPath) {

    const query = `query { group(fullPath: "${groupFullPath}") { ${GRAPHQL_GROUP_MEMBERS_QUERY} } }`

    const response = await fetch(`https://gitlab.com/${GITLAB_GRAPHQL_ENDPOINT}?query=${query}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })

    const assignedUsers = new Users(await response.json())
    return assignedUsers

} 