const BADGE_COUNTER_ID = "all member mrs badge counter"

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
    badgeCounter.id = BADGE_COUNTER_ID
    badgeCounter.className = "gl-badge-content"
    badgeCounter.textContent = 0
    badgeCounterWrapper.appendChild(badgeCounter)

    const allMemberMRsTitle = document.createElement("span")
    allMemberMRsTitle.textContent = "All Member MRs"

    allMemberMRsA.appendChild(allMemberMRsTitle)
    allMemberMRsA.appendChild(badgeCounterWrapper)

    allMemberMRsLi.appendChild(allMemberMRsA)
    tabList.appendChild(allMemberMRsLi)

    const filterForm = document.getElementsByClassName("filter-form js-filter-form gl-w-full")[0]
    const filters = getFilters(filterForm)

    // Get number of merge requests
    getMergeRequestCountForGroupMembers(filters).then(count => badgeCounter.textContent = count)

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

        // The filter and sort fields
        modifyFilterSection(mrListings)
        modifySortSection(mrListings)
        modifyOrderButton()

        // TODO: Disable recent filters button for now
        document.getElementsByClassName("dropdown-menu-toggle gl-button btn btn-default filtered-search-history-dropdown-toggle-button")[0].disabled = true

        // const filters = getFilters(filterForm)
        getUserToAllMergeRequests(filters).then(users => {
            const sortBy = getSortByField()
            const order = getOrderByField()
            const liElems = users.allAssignedMRsAsLiElements(sortBy, order)
            modifyMilestonesFilter(users.getAllMilestones())
            if (liElems.length == 0) mrListings.replaceChildren(buildEmptyMRsContent())
            else mrListings.replaceChildren(...liElems)
            document.getElementById(BADGE_COUNTER_ID).textContent = liElems.length
        })

    })
}

function getFilters(form) {
    const filterElems = form.getElementsByClassName("tokens-container list-unstyled")[0]
    const filters = {}

    for (let i = 0; i < filterElems.children.length - 1; i++) {
        const currElem = filterElems.children[i]
        const key = currElem.getElementsByClassName(" name")[0].textContent.trim()
        const op = currElem.getElementsByClassName("operator")[0].textContent.trim()
        const valueContainer = currElem.getElementsByClassName("value-container")[0]
        const value = valueContainer.getAttribute("data-original-value")
            ? valueContainer.getAttribute("data-original-value").trim()
            : valueContainer?.firstElementChild.textContent.trim()
        if (currElem && key && op && value) filters[key] = (op == "=" ? "" : "!") + value
    }
    return filters
}

function modifyFilterSection(mrListings) {
    const filterForm = document.getElementsByClassName("filter-form js-filter-form gl-w-full")[0]
    filterForm.addEventListener("keydown", (event) => {
        if (event.key === 'Enter') {
            event.stopPropagation()
            event.preventDefault()

            const sortBy = getSortByField()
            const order = getOrderByField()
            const filters = getFilters(filterForm)
            getUserToAllMergeRequests(filters).then(users => {
                const liElems = users.allAssignedMRsAsLiElements(sortBy, order)
                document.getElementById(BADGE_COUNTER_ID).textContent = liElems.length
                if (liElems.length == 0) mrListings.replaceChildren(buildEmptyMRsContent())
                else mrListings.replaceChildren(...liElems)
            })

        }
    }, true)

    const clearButton = filterForm.getElementsByClassName("gl-button btn btn-icon btn-sm btn-default btn-default-tertiary clear-search hidden gl-self-center gl-mr-1 has-tooltip")[0]
    if (!clearButton) return
    clearButton.addEventListener("click", (event) => {
        event.stopPropagation()
        event.preventDefault()
        const activeFilters = filterForm.getElementsByClassName("filtered-search-token")
        const filterList = activeFilters[0].parentElement
        const remainder = filterList.getElementsByClassName("input-token")[0]
        filterList.replaceChildren(remainder)
    }, true)

}

function modifyMilestonesFilter(milestones) {
    const milestoneDropdown = document.getElementById("js-dropdown-milestone")
    const dropdownListOther = document.createElement("ul")
    dropdownListOther.className = "filter-dropdown"

    for (let milestone of milestones) {
        const milestoneLi = document.createElement("li")
        milestoneLi.className = "filter-dropdown-item"
        milestoneLi.style = "display: block;"

        const milestoneButton = document.createElement("button")
        milestoneButton.type = "button"
        milestoneButton.className = "gl-button btn btn-md btn-link js-data-value"

        const milestoneSpan = document.createElement("span")
        milestoneSpan.className = "gl-button-text"
        milestoneSpan.textContent = milestone

        milestoneButton.appendChild(milestoneSpan)
        milestoneLi.appendChild(milestoneButton)
        dropdownListOther.appendChild(milestoneLi)
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {

            if (mutation.type === "attributes") {
                if (mutation.target.getAttribute("data-dropdown-active") === "true") {
                    milestoneDropdown.appendChild(dropdownListOther)
                }
            }
            else if (mutation.type === "childList") {
                if (mutation.target.children[1].children.length > 0) {
                    mutation.target.children[1].replaceChildren()
                }
            }
        })
    })

    observer.observe(milestoneDropdown, { attributes: true, childList: true, subtree: false, attributeFilter: ["data-dropdown-active"] })
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
            ? `${ICONS_PATH}#sort-lowest`
            : `${ICONS_PATH}#sort-highest`)
    })
}

function modifySortSection(mrListings) {
    // Ensure the position of drop down is the same as the others.
    const sortButtonGroup = document.getElementsByClassName("gl-new-dropdown gl-new-dropdown js-redirect-listbox btn-group")[0]
    sortButtonGroup.getElementsByClassName("gl-new-dropdown-panel")[0].style = "left: -122.406px; top: 36px;"

    const sortFieldOptions = sortButtonGroup.getElementsByClassName("gl-new-dropdown-contents")[0]
    let currSelectedSortOptions = sortFieldOptions.querySelector("li[aria-selected=true]")

    const sortFieldButton = sortButtonGroup.getElementsByClassName("gl-new-dropdown-toggle")[0]
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

            const filterForm = document.getElementsByClassName("filter-form js-filter-form gl-w-full")[0]

            const sortBy = getSortByField()
            const order = getOrderByField()
            const filters = getFilters(filterForm)
            getUserToAllMergeRequests(filters).then(users => {
                const liElems = users.allAssignedMRsAsLiElements(sortBy, order)
                document.getElementById(BADGE_COUNTER_ID).textContent = liElems.length
                if (liElems.length == 0) mrListings.replaceChildren(buildEmptyMRsContent())
                else mrListings.replaceChildren(...liElems)

            })

        }, true)
    }
}

function getSortByField() {
    const sortButtonGroup = document.getElementsByClassName("gl-new-dropdown gl-new-dropdown js-redirect-listbox btn-group")[0]
    const sortButton = sortButtonGroup.getElementsByClassName("gl-new-dropdown-toggle")[0]
    return sortButton.getElementsByClassName("gl-new-dropdown-button-text")[0].textContent.trim()
}

function getOrderByField() {
    return document.getElementsByClassName("gl-button btn btn-icon btn-md btn-default has-tooltip reverse-sort-btn rspec-reverse-sort")[0]
        .firstElementChild.getAttribute("data-testid") == "sort-highest-icon"
        ? "desc"
        : "asc"
}

function toggleOpenSortFieldDropDown(sortButton, selectedOption) {
    const btngroup = document.getElementsByClassName("gl-new-dropdown gl-new-dropdown js-redirect-listbox btn-group")[0]
    if (sortButton.ariaExpanded === "true") {
        sortButton.ariaExpanded = "false"
        btngroup.getElementsByClassName("gl-new-dropdown-panel")[0].classList.remove("!gl-block")
        btngroup.getElementsByClassName("gl-new-dropdown-contents")[0].classList.remove("top-scrim-visible", "bottom-scrim-visible")
        selectedOption.tabIndex = -1
    }
    else {
        sortButton.ariaExpanded = "true"
        btngroup.getElementsByClassName("gl-new-dropdown-panel")[0].classList.add("!gl-block", "gl-absolute")
        btngroup.getElementsByClassName("gl-new-dropdown-contents")[0].classList.add("top-scrim-visible", "bottom-scrim-visible")
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

