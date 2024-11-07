
function loadContent() {
    const contentBody = document.getElementById("content-body")
    if (!contentBody) return;
    const mrDOMList = contentBody.lastElementChild
    // Store a clone for when the include button is click again
    const internalMRs = [...mrDOMList.children]

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

function parseGroupFullPath(url) {
    const index = url.lastIndexOf("/")
    return url.substring(index + 1);
}

loadContent()