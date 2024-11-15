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

    // Get number of merge requests
    getMergeRequestCountForGroupMembers().then(count => badgeCounter.textContent = count)

    allMemberMRsLi.addEventListener("click", () => {

        // It is already active, no need to pull data.
        if (!setOthersTabItemActive(allMemberMRsA)) return

        // Remove previous tabs contents we don't need.

        // The issues list
        const issuingList = contentBody.getElementsByClassName("content-list mr-list issuable-list")[0]
        if (issuingList) contentBody.removeChild(issuingList)

        // No listings section
        const emptySection = contentBody.getElementsByTagName("section")[0]
        if (emptySection) contentBody.removeChild(emptySection)

        // No merge requests to display
        if (badgeCounter.textContent == 0) {
            contentBody.appendChild(buildEmptyMRsContent())
            return
        }

        const mrListings = document.createElement("ul")
        mrListings.className = "content-list mr-list issuable-list"
        mrListings.replaceChildren(document.createTextNode("Loading..."))
        contentBody.appendChild(mrListings)

        // The sort buttons
        modifySortSection(mrListings)
        modifyOrderButton()

        // The filter bar

        getUserToAllMergeRequests().then(users => {
            const sortBy = getSortByField()
            const order = getOrderByField()
            const liElems = users.allAssignedMRsAsLiElements(sortBy, order)
            mrListings.replaceChildren(...liElems)
        })

    })
}

function modifyOrderButton() {
    const orderButton = document.getElementsByClassName("gl-button btn btn-icon btn-md btn-default has-tooltip reverse-sort-btn rspec-reverse-sort")[0]
    const modifiedButton = document.createElement("span")
    modifiedButton.className = "gl-button btn btn-icon btn-md btn-default has-tooltip reverse-sort-btn rspec-reverse-sort"
    modifiedButton.title = "Sort direction"
    modifiedButton.appendChild(orderButton.firstElementChild.cloneNode(true))
    orderButton.parentElement.replaceChild(modifiedButton, orderButton)
    let isDesc = modifiedButton.firstChild.getAttribute("data-testid") == "sort-highest-icon"

    modifiedButton.addEventListener("click", () => {
        isDesc = !isDesc

        const mrList = document.getElementsByClassName("content-list mr-list issuable-list")[0]
        mrList.append(...Array.from(mrList.childNodes).reverse());

        modifiedButton.firstChild.setAttribute("data-testid", !isDesc ? "sort-lowest-icon" : "sort-highest-icon")
        modifiedButton.firstChild.firstChild.setAttribute("href", !isDesc
            ? "/assets/icons-8791a66659d025e0a4c801978c79a1fbd82db1d27d85f044a35728ea7cf0ae80.svg#sort-lowest"
            : "/assets/icons-8791a66659d025e0a4c801978c79a1fbd82db1d27d85f044a35728ea7cf0ae80.svg#sort-highest")
    })
}

function modifySortSection(mrListings) {
    // Ensure the position of drop down is the same as the others.
    document.getElementById("base-dropdown-40").style = "left: -122.406px; top: 36px;"

    const sortFieldOptions = document.getElementById("listbox-39")
    let currSelectedSortOptions = sortFieldOptions.querySelector("li[aria-selected=true]")

    const sortFieldButton = document.getElementById("dropdown-toggle-btn-38")
    const sortFieldButtonText = sortFieldButton.getElementsByClassName("gl-new-dropdown-button-text")[0]
    sortFieldButton.addEventListener("click", (event) => {
        // Manually manage drop down
        event.stopPropagation()
        event.preventDefault()
        // Open/close drop down
        toggleOpenSortFieldDropDown(sortFieldButton, currSelectedSortOptions)
    }, true)

    for (let i in sortFieldOptions.children) {
        const currItem = sortFieldOptions.children[i]
        if (currItem.className != "gl-new-dropdown-item") continue
        // TODO: send GET Request to get MR results with specific sorting
        currItem.addEventListener("click", (event) => {
            // Stops the page redirect when sort orders are clicked
            event.stopPropagation()
            event.preventDefault()
            // De-select previous option
            currSelectedSortOptions.removeAttribute("aria-selected")
            currSelectedSortOptions.querySelector("svg").classList.add("gl-invisible")
            currSelectedSortOptions.tabIndex = -1
            // Select new option
            currItem.setAttribute("aria-selected", "true")
            currItem.querySelector("svg").classList.remove("gl-invisible")
            sortFieldButtonText.textContent = currItem.getElementsByClassName("gl-new-dropdown-item-text-wrapper")[0].textContent
            currSelectedSortOptions = currItem
            toggleOpenSortFieldDropDown(sortFieldButton, currSelectedSortOptions)
            sortFieldButton.focus()

            const sortBy = getSortByField()
            const order = getOrderByField()
            getUserToAllMergeRequests().then(users => {
                const liElems = users.allAssignedMRsAsLiElements(sortBy, order)
                mrListings.replaceChildren(...liElems)
            })

        }, true)
    }
}

function getSortByField() {
    const sortButton = document.getElementById("dropdown-toggle-btn-38")
    return sortButton.getElementsByClassName("gl-new-dropdown-button-text")[0].textContent.trim()
}

function getOrderByField() {
    return document.getElementsByClassName("gl-button btn btn-icon btn-md btn-default has-tooltip reverse-sort-btn rspec-reverse-sort")[0]
        .firstElementChild.getAttribute("data-testid") == "sort-highest-icon"
        ? "desc"
        : "asc"
}

function toggleOpenSortFieldDropDown(sortButton, selectedOption) {
    if (sortButton.ariaExpanded === "true") {
        sortButton.ariaExpanded = "false"
        document.getElementById("base-dropdown-40").classList.remove("!gl-block")
        document.getElementById("listbox-39").classList.remove("top-scrim-visible", "bottom-scrim-visible")
        selectedOption.tabIndex = -1
    }
    else {
        sortButton.ariaExpanded = "true"
        document.getElementById("base-dropdown-40").classList.add("!gl-block", "gl-absolute")
        document.getElementById("listbox-39").classList.add("top-scrim-visible", "bottom-scrim-visible")
        selectedOption.tabIndex = 0
        selectedOption.focus()
    }
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

const contentBody = document.getElementById("content-body")
if (!contentBody) exit(0);
allMemberMergeRequests(contentBody)