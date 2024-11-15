const SORT_BY = Object.freeze({
    "Priority": null,
    "Created date asc": (mr1, mr2) => mr1.creationDateTime > mr2.creationDateTime ? 1 : -1,
    "Created date desc": (mr1, mr2) => mr1.creationDateTime < mr2.creationDateTime ? 1 : -1,
    "Closed date asc": (mr1, mr2) => mr1.closed_date > mr2.closed_date ? 1 : -1,
    "Closed date desc": (mr1, mr2) => mr1.closed_date < mr2.closed_date ? 1 : -1,
    "Updated date asc": (mr1, mr2) => mr1.updatedDateTime > mr2.updatedDateTime ? 1 : -1,
    "Updated date desc": (mr1, mr2) => mr1.updatedDateTime < mr2.updatedDateTime ? 1 : -1,
    "Milestone due date asc": (mr1, mr2) => mr1.milestone_due_date > mr2.milestone_due_date ? 1 : -1,
    "Milestone due date desc": (mr1, mr2) => mr1.milestone_due_date < mr2.milestone_due_date ? 1 : -1,
    "Popularity asc": (mr1, mr2) => mr1.populatority > mr2.populatority ? 1 : -1,
    "Popularity desc": (mr1, mr2) => mr1.populatority < mr2.populatority ? 1 : -1,
    "Label priority": null,
    "Title asc": (mr1, mr2) => mr1.title > mr2.title ? 1 : -1,
    "Title desc": (mr1, mr2) => mr1.title < mr2.title ? 1 : -1
});

class Users {

    constructor(graphqlJSON) {
        this.users = []
        this.parseGraphqlJSON(graphqlJSON.data.group.groupMembers)
    }

    parseGraphqlJSON(usersJSON) {
        usersJSON.nodes.forEach(node => this.users.push(new User(node.user)));
    }

    /**
     * Outputs all merge request results as li DOM elements, where the listing is sorted
     * by sortBy in the order of asc or desc.
     * 
     * @param {String} sortBy The merge request field to sort the results by
     * @param {String} order  asc or desc
     * @returns 
     */
    allAssignedMRsAsLiElements(sortBy, order) {
        return this.users.map(user => user.assignedMergeRequests.mergeRequests)
            .flat()
            .sort(SORT_BY[`${sortBy} ${order}`])
            .map(mr => mr.toLiElement())
    }
}

class User {
    constructor(graphqlJSON) {
        this.parseGraphqlJSON(graphqlJSON)
    }

    parseGraphqlJSON(userJSON) {
        this.id = this.parseId(userJSON.id)
        this.username = userJSON.username;
        this.name = userJSON.name;
        this.avatarUrl = userJSON.avatarUrl;
        this.webPath = userJSON.webPath;
        this.assignedMergeRequests = new MergeRequests(userJSON.assignedMergeRequests, this)
    }

    parseId(rawId) {
        const index = rawId.lastIndexOf("/")
        return rawId.substring(index + 1);
    }
}