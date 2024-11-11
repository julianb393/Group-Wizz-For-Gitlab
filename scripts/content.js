
function allMemberMergeRequests(contentBody) {
    const tabList = document.getElementsByClassName("issues-state-filters gl-border-b-0 gl-grow nav gl-tabs-nav")[0]

    const allMemberMRsLi = document.createElement("li")
    allMemberMRsLi.role = "presentation"
    allMemberMRsLi.className = "nav-item"
    allMemberMRsLi.style = "cursor: pointer; user-select: none;"

    const allMemberMRsA = document.createElement("span")
    allMemberMRsA.id = "state-other"
    allMemberMRsA.title = "Display all open merge requests belonging to group members."
    allMemberMRsA.setAttribute("data-state", "other")
    allMemberMRsA.role = "tab"
    allMemberMRsA.className = "nav-link gl-tab-nav-item"

    const badgeCounterWrapper = document.createElement("span")
    badgeCounterWrapper.className = "gl-badge badge badge-pill badge-muted gl-tab-counter-badge gl-hidden sm:gl-inline-flex"

    const badgeCounter = document.createElement("span")
    badgeCounter.className = "gl-badge-content"
    badgeCounter.textContent = 0
    badgeCounterWrapper.appendChild(badgeCounter)

    const allMemberMRsTitle = document.createElement("span")
    allMemberMRsTitle.textContent = "All Member MRs"

    allMemberMRsA.appendChild(allMemberMRsTitle)
    allMemberMRsA.appendChild(badgeCounterWrapper)


    allMemberMRsLi.appendChild(allMemberMRsA)
    tabList.appendChild(allMemberMRsLi)

    // Remove Top Area search/filter



    // Get number of merge requests
    const groupFullPath = parseGroupFullPath(document.getElementsByClassName("gl-breadcrumb-item")[0].firstElementChild.href)
    getMergeRequestCountForGroupMembers(groupFullPath).then(count => badgeCounter.textContent = count)

    allMemberMRsLi.addEventListener("click", () => {

        // It is already active, no need to pull data.
        if (!setOthersTabItemActive(allMemberMRsA)) return

        // Remove previous tabs contents we don't need.
        contentBody.replaceChildren(...[...contentBody.children].slice(0, 2))

        // No merge requests to display
        if (badgeCounter.textContent == 0) {
            contentBody.appendChild(buildEmptyMRsContent())
            return
        }

        const mrListings = document.createElement("ul")
        mrListings.className = "content-list mr-list issuable-list"
        mrListings.replaceChildren(document.createTextNode("Loading..."))
        contentBody.appendChild(mrListings)

        getUserToAllMergeRequests(groupFullPath).then(users => {
            const liElems = users.allAssignedMRsAsLiElements()
            mrListings.replaceChildren(...liElems)
        })

    })
}

function buildEmptyMRsContent() {
    const section = document.createElement("section")
    section.className = "gl-flex gl-empty-state gl-text-center gl-flex-col"
    section.setAttribute("data-testid", "issuable-empty-state")

    const imgWrapper = document.createElement("div")
    imgWrapper.className = "gl-max-w-full"
    const img = document.createElement("img")
    img.className = "gl-dark-invert-keep-hue"
    img.src = "/assets/illustrations/empty-state/empty-merge-requests-md-83c3b841d9a122ce0e973f4af5eef433195ff43b409ce600cf8794d412fcda2b.svg"
    imgWrapper.appendChild(img)

    const titleWrapper = document.createElement("div")
    titleWrapper.className = "gl-empty-state-content gl-mx-auto gl-my-0 gl-m-auto gl-p-5"
    const title = document.createElement("h1")
    title.className = "gl-text-size-h-display gl-leading-36 gl-mt-0 gl-mb-0 h4"
    title.textContent = "There are no open merge requests for any members in this group"
    titleWrapper.appendChild(title)

    section.appendChild(imgWrapper)
    section.appendChild(titleWrapper)

    return section
}

function setOthersTabItemActive(othersTabItem) {

    if (othersTabItem.classList.contains("active")) return false

    const currentActive = document.getElementsByClassName("nav-link gl-tab-nav-item active gl-tab-nav-item-active")[0]

    othersTabItem.classList.add("active", "gl-tab-nav-item-active")
    currentActive.classList.remove("active", "gl-tab-nav-item-active")

    return true
}

function addMergeRequestTabButtons(contentBody, mrDOMList, internalMRs) {

    const listTypeSelector = document.createElement("ul")
    listTypeSelector.setAttribute("class", "issues-state-filters gl-border-b-0 gl-grow nav gl-tabs-nav")
    listTypeSelector.setAttribute("role", "tablist")

    // Internal
    const internalItem = document.createElement("li")
    internalItem.role = "presentation"
    internalItem.className = "nav-item"
    const internalBtn = document.createElement("button")
    internalBtn.textContent = "Internal"
    internalBtn.className = "nav-link gl-tab-nav-item active gl-tab-nav-item-active"

    internalItem.appendChild(internalBtn)

    // All
    const allItem = document.createElement("li")
    allItem.role = "presentation"
    allItem.className = "nav-item"

    const allBtn = document.createElement("button")
    allBtn.textContent = "All"
    allBtn.className = "nav-link gl-tab-nav-item"
    allItem.appendChild(allBtn)

    const groupFullPath = parseGroupFullPath(document.getElementsByClassName("gl-breadcrumb-item")[0].firstElementChild.href)

    internalBtn.addEventListener("click", () => {
        internalBtn.blur()
        setButtonsActiveStatuses(true, internalBtn, allBtn)
        mrDOMList.replaceChildren(...internalMRs)
    })
    allBtn.addEventListener("click", () => {
        allBtn.blur()
        setButtonsActiveStatuses(false, internalBtn, allBtn)
        mrDOMList.replaceChildren(document.createTextNode("Loading..."))

        getUserToAllMergeRequests(groupFullPath).then(users => {
            const liElems = users.allAssignedMRsAsLiElements()
            const mrDOMList = contentBody.lastElementChild
            mrDOMList.replaceChildren(...liElems)
        })
    })

    listTypeSelector.appendChild(internalItem)
    listTypeSelector.appendChild(allItem)
    // Insert before the merge request list
    contentBody.insertBefore(listTypeSelector, contentBody.children.item(4))
}

function setButtonsActiveStatuses(selectInternal, internalBtn, allBtn) {
    if (selectInternal) {
        internalBtn.classList.add("active", "gl-tab-nav-item-active")
        allBtn.classList.remove("active", "gl-tab-nav-item-active")
    }
    else {
        allBtn.classList.add("active", "gl-tab-nav-item-active")
        internalBtn.classList.remove("active", "gl-tab-nav-item-active")
    }
}

function isInternalTabActive(internBtn) {
    return internBtn.classList.contains("active")
}

function parseGroupFullPath(url) {
    const index = url.lastIndexOf("/")
    return url.substring(index + 1);
}

const contentBody = document.getElementById("content-body")
if (!contentBody) exit(0);
allMemberMergeRequests(contentBody)