class MergeRequests {
    constructor(graphqlJSON, assignedUser) {
        this.assignedUser = assignedUser
        this.mergeRequests = []
        this.parseGraphqlJSON(graphqlJSON)
    }
    parseGraphqlJSON(mrsJSON) {
        mrsJSON?.nodes.forEach(mr => this.mergeRequests.push(new MergeRequest(mr, this.assignedUser)));
    }

    toLiElements() {
        return this.mergeRequests.map((mr) => mr.toLiElement())
    }
}

class MergeRequest {
    constructor(graphqlJSON, assignedUser) {
        this.assignedUser = assignedUser
        this.parseGraphqlJSON(graphqlJSON)
    }

    parseGraphqlJSON(mrJSON) {
        this.title = mrJSON.title;
        this.webPath = mrJSON.webPath
        this.project = mrJSON.project.path;
        this.creationDateTime = mrJSON.createdAt;
        this.updatedDateTime = mrJSON.updatedAt;
        this.author = new User(mrJSON.author)
        this.reviewers = mrJSON.reviewers?.nodes.map(node => new User(node))
        this.closedAt = mrJSON.closedAt
        this.milestone = mrJSON.milestone?.title
        this.milestoneDueDate = mrJSON.milestone?.dueDate
        this.projectMilestoneUrl = mrJSON.project?.webUrl + `?milestone_title=${this.milestone}`
        this.upvotes = mrJSON.upvotes
        this.downvotes = mrJSON.downvotes
        this.pipelineStatus = mrJSON.headPipeline?.status
        this.pipelinePath = mrJSON.headPipeline?.webpath
    }

    toLiElement() {

        const template = MERGE_REQUEST_TEMPLATE.cloneNode(true)

        // title
        const title = template.getElementById("template-title")
        title.textContent = this.title
        title.href = this.webPath

        // project
        template.getElementById("template-project").textContent = this.project

        // author
        const author = template.getElementById("template-author")
        author.setAttribute("data-user-id", this.author.id)
        author.setAttribute("data-username", this.author.username)
        author.setAttribute("data-name", this.author.name)
        author.href = this.author.webPath
        author.firstElementChild.textContent = this.author.name

        // created at
        const createdAt = template.getElementById("template-createdAt")
        createdAt.datetime = this.creationDateTime
        const createdAtDate = new Date(Date.parse(this.creationDateTime))
        createdAt.title = `${createdAtDate.toLocaleString('default', { month: 'long' })} ${createdAtDate.getDate()}, ${createdAtDate.getFullYear()} at ${createdAtDate.toLocaleTimeString('en-us', { timeZoneName: 'short' })}`
        createdAt.textContent = this.howLongAgo(createdAtDate)

        // updated at
        const updatedAt = template.getElementById("template-updatedAt")
        updatedAt.datetime = this.updatedDateTime
        const updatedAtDate = new Date(Date.parse(this.updatedDateTime))
        updatedAt.title = `${updatedAtDate.toLocaleString('default', { month: 'long' })} ${updatedAtDate.getDate()}, ${updatedAtDate.getFullYear()} at ${updatedAtDate.toLocaleTimeString('en-us', { timeZoneName: 'short' })}`
        updatedAt.textContent = this.howLongAgo(updatedAtDate)

        // assigned
        const assigned = template.getElementById("template-assigned")
        assigned.title = `Assigned to ${this.assignedUser.name}`
        assigned.href = this.assignedUser.webPath
        assigned.firstElementChild.src = this.assignedUser.avatarUrl

        // reviewers
        if (this.reviewers.length == 0) {
            template.getElementById("template-reviewer").remove()
        }
        for (let i = 0; i < this.reviewers.length; i++) {
            let reviewer = template.getElementById("template-reviewer")
            reviewer.title = `Review requested from ${this.reviewers[i].name}`
            reviewer.href = this.reviewers[i].webPath
            reviewer.firstElementChild.src = this.reviewers[i].avatarUrl
        }

        if (this.upvotes == 0) template.getElementById("template-upvotes-wrapper").remove()
        else template.getElementById("template-upvotes").textContent = this.upvotes

        if (this.downvotes == 0) template.getElementById("template-downvotes-wrapper").remove()
        else template.getElementById("template-downvotes").textContent = this.downvotes

        if (!this.milestone) {
            template.getElementById("template-milestone-wrapper").remove()
        }
        else {
            const milestoneLink = template.getElementById("template-milestone-link")
            milestoneLink.href = this.projectMilestoneUrl
            if (this.milestoneDueDate) {
                const milestoneDueDate = new Date(this.milestoneDueDate)
                const dateTitle = `${milestoneDueDate.toLocaleString('default', { month: 'short' })} ${milestoneDueDate.getDate()}, ${milestoneDueDate.getFullYear()}`
                milestoneLink.setAttribute("data-title", milestoneDueDate < new Date() ? dateTitle + " (<strong>Past due</strong>)" : dateTitle)
            }
            template.getElementById("template-milestone").textContent = this.milestone
        }

        if (!this.pipelineStatus) {
            template.getElementById("template-pipeline-success-wrapper").remove()
            template.getElementById("template-pipeline-running-wrapper").remove()
            template.getElementById("template-pipeline-failed-wrapper").remove()
        }
        else {
            switch (this.pipelineStatus) {
                case "SUCCESS":
                    template.getElementById("template-pipeline-running-wrapper").remove()
                    template.getElementById("template-pipeline-failed-wrapper").remove()
                    template.getElementById("template-pipeline-success-link").href = this.pipelinePath
                    break
                case "RUNNING":
                    template.getElementById("template-pipeline-success-wrapper").remove()
                    template.getElementById("template-pipeline-failed-wrapper").remove()
                    template.getElementById("template-pipeline-running-link").href = this.pipelinePath
                case "FAILED":
                    template.getElementById("template-pipeline-running-wrapper").remove()
                    template.getElementById("template-pipeline-success-wrapper").remove()
                    template.getElementById("template-pipeline-failed-link").href = this.pipelinePath
                    break
                default:
                    template.getElementById("template-pipeline-success-wrapper").remove()
                    template.getElementById("template-pipeline-running-wrapper").remove()
                    template.getElementById("template-pipeline-failed-wrapper").remove()
                    break;
            }
        }

        return template.getElementById("merge_request_template")
    }

    howLongAgo(fromDate) {
        const now = new Date()
        const yearsAgo = now.getFullYear() - fromDate.getFullYear()
        if (yearsAgo > 0) {
            return `${yearsAgo} year${yearsAgo == 1 ? "" : "s"} ago`
        }

        const monthsAgo = now.getMonth() - fromDate.getMonth()
        if (monthsAgo > 0) {
            return `${monthsAgo} month${monthsAgo == 1 ? "" : "s"} ago`
        }

        const daysAgo = now.getDate() - fromDate.getDate()
        if (daysAgo > 0) {
            return `${daysAgo} day${daysAgo == 1 ? "" : "s"} ago`
        }

        const timeAgo = now.getTime() - fromDate.getTime()
        const hoursAgo = Math.floor((timeAgo / (1000 * 60 * 60)) % 24)

        if (hoursAgo > 0) {
            return `${hoursAgo} hour${hoursAgo == 1 ? "" : "s"} ago`
        }

        const minutesAgo = Math.floor((timeAgo / (1000 * 60)) % 60)
        if (minutesAgo > 0) {
            return `${minutesAgo} hour${minutesAgo == 1 ? "" : "s"} ago`
        }

        return "a few seconds ago"
    }
}