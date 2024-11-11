class Users {
    constructor(graphqlJSON) {
        this.users = []
        this.parseGraphqlJSON(graphqlJSON.data.group.groupMembers)
    }

    parseGraphqlJSON(usersJSON) {
        usersJSON.nodes.forEach(node => this.users.push(new User(node.user)));
    }

    allAssignedMRsAsLiElements() {
        const sortMRs = (mr1, mr2) => {
            return mr1.updatedDateTime > mr2.updatedDateTime
        }
        return this.users.map(user => user.assignedMergeRequests.mergeRequests).flat().sort(sortMRs).map(mr => mr.toLiElement())
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