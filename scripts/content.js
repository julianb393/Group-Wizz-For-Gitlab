
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

    // External
    const externalItem = document.createElement("li")
    externalItem.role = "presentation"
    externalItem.className = "nav-item"

    const externalBtn = document.createElement("button")
    externalBtn.textContent = "External"
    externalBtn.className = "nav-link gl-tab-nav-item"
    externalItem.appendChild(externalBtn)

    const groupFullPath = parseGroupFullPath(document.getElementsByClassName("gl-breadcrumb-item")[0].firstElementChild.href)

    internalBtn.addEventListener("click", () => {
        internalBtn.blur()
        setButtonsActiveStatuses(true, internalBtn, externalBtn)
        mrDOMList.replaceChildren(...internalMRs)
    })
    externalBtn.addEventListener("click", () => {
        externalBtn.blur()
        setButtonsActiveStatuses(false, internalBtn, externalBtn)
        mrDOMList.replaceChildren(document.createTextNode("Loading..."))

        getUserToExternalMergeRequests(groupFullPath).then(users => {
            const liElems = users.allAssignedMRsAsLiElements()
            const mrDOMList = contentBody.lastElementChild
            mrDOMList.replaceChildren(...liElems)
        })
    })

    listTypeSelector.appendChild(internalItem)
    listTypeSelector.appendChild(externalItem)

    contentBody.insertBefore(listTypeSelector, contentBody.lastElementChild)
}

function setButtonsActiveStatuses(selectInternal, internalBtn, externalBtn) {
    if (selectInternal) {
        internalBtn.classList.add("active", "gl-tab-nav-item-active")
        externalBtn.classList.remove("active", "gl-tab-nav-item-active")
    }
    else {
        externalBtn.classList.add("active", "gl-tab-nav-item-active")
        internalBtn.classList.remove("active", "gl-tab-nav-item-active")
    }
}

function parseGroupFullPath(url) {
    const index = url.lastIndexOf("/")
    return url.substring(index + 1);
}

loadContent()