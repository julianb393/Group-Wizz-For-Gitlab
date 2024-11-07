const MERGE_REQUEST_TEMPLATE = (new DOMParser).parseFromString(`<li class="merge-request" data-id="TODO" data-labels="[]" id = "merge_request_template" >
    <div class="issuable-info-container gl-flex-col md:gl-flex-row gl-gap-3">
        <div class="issuable-main-info !gl-mr-0">
            <div class="merge-request-title title">
                <span class="merge-request-title-text js-onboarding-mr-item">

                    <a id="template-title" class="js-prefetch-document"
                        href="TODO">TODO</a>
                </span>
            </div>
            <div class="issuable-info">
                <span id="template-project" class="issuable-reference gl-inline-block">
                    TODO
                </span>
                <span class="gl-hidden sm:gl-inline">
                    <span
                        class="issuable-authored gl-inline-block !gl-text-gray-500">
                        ·
                        created <time id="template-createdAt" class="js-timeago"
                            title="TODO"
                            datetime="TODO"
                            data-toggle="tooltip" data-placement="bottom"
                            data-container="body">TODO</time>
                        by
                        <a
                            id="template-author"
                            class="author-link !gl-text-gray-500 js-user-link"
                            data-user-id="TODO"
                            data-username="TODO"
                            data-name="TODO"
                            href="/TODO">
                            <span class="author">TODO</span>
                        </a>
                    </span>
                </span>
            </div>
        </div>
        <div
            class="gl-text-sm gl-flex gl-shrink-0 gl-self-start gl-gap-1 gl-flex-row gl-justify-between gl-w-full md:gl-w-auto md:!gl-flex-col">
            <ul class="controls gl-gap-3 gl-pl-0 gl-self-end">
                <li class="gl-flex !gl-mr-0">
                    <a id="template-assigned" class="author-link has-tooltip"
                        title="TODO" data-container="body"
                        href="TODO"><img width="16"
                            class="avatar avatar-inline s16 js-lazy-loaded" alt
                            src="TODO"
                            loading="lazy"
                            data-testid="js-lazy-loaded-content"></a>

                </li>
                <li id="template-reviewer-li" class="gl-flex issuable-reviewers !gl-mr-0">
                    <a id="template-reviewer" class="author-link has-tooltip"
                        title="TODO"
                        data-container="body" href="TODO"><img
                            width="16"
                            class="avatar avatar-inline s16 js-lazy-loaded" alt
                            src="TODO"
                            loading="lazy"
                            data-testid="js-lazy-loaded-content"></a>

                </li>

            </ul>
            <div
                class="issuable-updated-at gl-self-end gl-hidden sm:gl-inline-block gl-text-gray-500">
                <span>
                    updated <time id="template-updatedAt" class="js-timeago merge_request_updated_ago"
                        title="TODO"
                        datetime="TODO" data-toggle="tooltip"
                        data-placement="bottom" data-container="body">just
                        now</time>
                </span>
            </div>
        </div>
    </div>
</li>`, "text/html")

