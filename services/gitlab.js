const GRAPHQL_MRS_QUERY_BODY = `nodes {
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
              downvotes
            }`

const GRAPHQL_COUNT_MRS_QUERY_BODY = "count"

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

const GRAPHQL_FILTER_KEYS = {
  "author": "authorUsername",
  "reviewer": "reviewerUsername",
  "merge-user": "mergedBy",
  "approver": "approver",
  "approved-by": "approvedBy",
  "milestone": "milestoneTitle",
  "label": "labelName",
  "release": "releaseTag",
  "my-reaction": "myReactionEmoji",
  "draft": "draft",
  "target-branch": "targetBranches",
  "source-branch": "sourceBranches",
  "environment": "environmentName",
  "deployed-before": "deployedBefore",
  "deployed-after": "deployedAfter"
}

function convertParamsToGRAPHQL(params = {}) {
  const filters = []
  const negatedFilters = []
  for (let [key, value] of Object.entries(params)) {
    const isNegated = value.charAt(0) == "!"
    let valStartAt = isNegated ? 1 : 0
    let valEndAt = value.length
    switch (key) {
      case "assignee":
        // Handled in post-processing since GRAPHQL can't handle this for assigned merge requests.
        continue;
      case "author":
      case "reviewer":
      case "merge-user":
      case "approver":
      case "approved-by":
        valStartAt += 1
        break;
      case "milestone":
        if (value.substring(valStartAt).charAt(0) != "%") break;
        valStartAt += 2
        valEndAt -= 1
        break;
      default:
        break;
    }
    isNegated
      ? negatedFilters.push(`${GRAPHQL_FILTER_KEYS[key]}: "${value.substring(valStartAt, valEndAt)}"`)
      : filters.push(`${GRAPHQL_FILTER_KEYS[key]}: "${value.substring(valStartAt, valEndAt)}"`)
  }
  if (negatedFilters.length != 0) filters.push(" not: " + `{ ${negatedFilters.join(",")} }`)
  if (filters.length != 0) return "," + filters.join(",")
  return ""
}

function filterAsignee(username, assignee) {
  if (!assignee) return true
  else if (assignee.charAt(0) == "!") {
    return username == assignee.substring(2)
  }
  return username != assignee.substring(1)
}

async function getUserToAllMergeRequests(params = {}) {

  const filters = convertParamsToGRAPHQL(params)
  const query = `query { 
    group(fullPath: "${GROUP_FULL_PATH}") {
      groupMembers {
        nodes {
          user {
            id
            username
            name
            avatarUrl
            webPath
            assignedMergeRequests(state: opened ${filters}) {
              ${GRAPHQL_MRS_QUERY_BODY}
            }
          }
        }
      } 
    } 
  }`.replaceAll("\n", "")

  const response = await fetch(`https://${HOSTNAME}/${GITLAB_GRAPHQL_ENDPOINT}?query=${query}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })

  const assignedUsers = new Users(await response.json())
  assignedUsers.filterUsers((username) => filterAsignee(username, params["assignee"]))
  return assignedUsers
}

async function getMergeRequestCountForGroupMembers(params = {}) {
  const filters = convertParamsToGRAPHQL(params)

  let count = 0

  const query = `query { 
    group(fullPath: "${GROUP_FULL_PATH}") {
      groupMembers {
        nodes {
          user {
            username
            assignedMergeRequests(state: opened ${filters}) {
              ${GRAPHQL_COUNT_MRS_QUERY_BODY}
            }
          }
        }
      } 
    } 
  }`.replaceAll("\n", "")


  const response = await fetch(`https://${HOSTNAME}/${GITLAB_GRAPHQL_ENDPOINT}?query=${query}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })

  await response.json().then(json => json.data.group.groupMembers.nodes
    .filter(node => filterAsignee(node.username, params["assignee"]))
    .forEach(node => count += node.user.assignedMergeRequests.count))
  return count
}