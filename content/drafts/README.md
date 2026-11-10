# Drafts

Each `.json` file here is an array of questions in the bank's format. The scheduled refresh adds a question to the bank only when its `review_status` is `"reviewed"` and its `id` is new. Draft questions are ignored, so unreviewed content is never published.

When the refresh adds questions, it opens a pull request that changes `content/bank/questions.json`. The bank changes only when that pull request is merged.
