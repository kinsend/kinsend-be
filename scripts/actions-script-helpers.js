/*
 * These are useful methods for use in a github actions script. They are
 * extracted here to make it easier to develop, share between workflows and
 * reduce the inline code in the workflow yaml files.
 *
 */

/*
 * stepMarkdownSnippet will return the formatted output of a step of this job.
 * It expects to find three environment variables:
 *   - STEP_${ stepName }_OUTCOME
 *   - STEP_${ stepName }_STDERR
 *   - STEP_${ stepName }_STDOUT
 * detailedSuccess determines whether a <summary> will be produced on success.
 * Steps that were 'skipped' never produce one and by default only steps that
 * end in 'failure' do.
 *
 */
function stepMarkdownSnippet(stepName, detailedSuccess) {
  let briefOutcomes = ["skipped"];
  if (!detailedSuccess) {
    briefOutcomes += "success";
  }
  const statusIcons = { success: "🟢", failure: "🔴", skipped: "⚪" }
  const outcome = process.env["STEP_" + stepName.toUpperCase() + "_OUTCOME"];
  const outcomeIcon = statusIcons[outcome];
  const stderr = process.env["STEP_" + stepName.toUpperCase() + "_STDERR"].trim();
  const stdout = process.env["STEP_" + stepName.toUpperCase() + "_STDOUT"].trim();
  const step = stepName.toLowerCase();

  // Note that this is an em space (U+2003) at the start of the string which
  // helps align with potential summary items that display an arrow. Normal
  // spaces don't work because markdown strips them.
  let snippet = ` <b>terraform ${step}:</b> ${outcomeIcon}<code>${outcome}</code>`;

  if (!briefOutcomes.includes(outcome)) {
    // We use html tags below for the details blocks and we more or less are
    // forced to use them inside the <summary> tags.
    // We also use ~~~ for the code block below since it doesn't require
    // escaping, see https://github.github.com/gfm/#example-90
    // Note: do not mess with the indentation below or it will break the markdown display in GH!
    snippet = `<details>
<summary><b>terraform ${step}:</b> ${outcomeIcon} <code>${outcome}</code></summary>

~~~
${outcome === "failure" ? stderr : stdout}
~~~

</details>`

    // Edge case - when the "plan" step contains "> 0 destroy" string.
    // Example: Plan: 1 to add, 2 to change, 3 to destroy.
    //          No changes. Your infrastructure matches the configuration.
    if (step === "plan") {
      const findChanges = [...stdout.matchAll(/([0-9]+) to add, ([0-9]+) to change, ([0-9]+) to destroy/gi)];
      const destroyCount = findChanges.length > 0 ? Number(findChanges[0][3]) : 0;
      const deletesResources = isNaN(destroyCount) || destroyCount > 0; // destroyCount should always be a number, but you never know with js.
      const destroyOutcome = deletesResources ? "failure" : "success";
      const destroyOutcomeIcon = statusIcons[destroyOutcome];

      // Note: do not mess with the indentation below or it will break the markdown display in GH!
      snippet += `
 <b>terraform plan-destroys-resources:</b> ${destroyOutcomeIcon}<code>${destroyCount + " resources to be deleted"}</code>
      `
  }

  }

  return snippet;
}

/*
 * matrixJobMarkdownLink generates a markdown link to the current github actions
 * run like so: [ ${ modulePath } ](https://github.com/owner/repo/runs/id)
 *
 * It expects to find a job named '<jobName> (<modulePath>)' where jobName is
 * taken from the context.
 *
 */
async function matrixJobMarkdownLink(github, context, modulePath) {
  const job = (
    await github.rest.actions.listJobsForWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: context.runId,
    })
  ).data.jobs.find((job) => {
    return job.name === `${context.job} (${modulePath})`;
  });
  return `[${modulePath}](${job.html_url}?check_suite_focus=true)`;
}

module.exports = {
  /*
   * commentResults creates a github pull request comment with the results of
   * the job, as described by steps array, which takes the following form:
   * [
   *   { name: 'stepA' },
   *   { name: 'stepB', detailedSuccess: true },
   * ]
   * see the stepMarkdownSnippet and matrixJobMarkdownLink functions above for
   * an explanation of these attributes and other assumptions.
   *
   */
  commentResults: async function (github, context, issueNumber, modulePath, steps) {
    let comment = "## " + (await matrixJobMarkdownLink(github, context, modulePath));

    steps.forEach(function (step) {
      comment += "\n\n" + stepMarkdownSnippet(step.name, step.detailedSuccess);
    });

    github.rest.issues.createComment({
      issue_number: issueNumber, // context.issue.number is not available, because the job is triggered via apply-comment-dispather.yaml.
      owner: context.repo.owner,
      repo: context.repo.repo,
      body: comment,
    });
  },

  /*
   * validateApplyCommand expects to be called in a workflow triggered by a
   * comment in a pull request. It will fail the step unless:
   *   - the pull request is in a 'clean' state
   *   - the user who issued the comment has the necessary permission level in
   *     the repository (by default 'admin')
   * If it fails, it will also create a comment in the pull request explaining
   * the reason.
   *
   */
  validateApplyCommand: async function (
    github,
    context,
    core,
    allowedPermissionLevels
  ) {
    if (!allowedPermissionLevels) {
      allowedPermissionLevels = ["admin"];
    }
    const user = context.payload.comment.user.login;
    let error = null;
    let errorComment = null;

    if (
      allowedPermissionLevels.indexOf(
        (
          await github.rest.repos.getCollaboratorPermissionLevel({
            owner: context.repo.owner,
            repo: context.repo.repo,
            username: user,
          })
        ).data.permission
      ) == -1
    ) {
      error = `${user} is not an admin of this repository`;
      errorComment = `@${user} only admins of this repository can trigger the apply job.`;
    } else if (
      (
        await github.rest.pulls.get({
          owner: context.repo.owner,
          repo: context.repo.repo,
          pull_number: context.issue.number,
        })
      ).data.mergeable_state !== "clean"
    ) {
      error = `The pull request is not mergeable`;
      errorComment =
        `@${user} you can only trigger the apply job on pull requests that are mergeable. Make ` +
        `sure all merge conflicts have been resolved, all required status checks have passed and that the ` +
        `pull request has the necessary approvals.`;
    }

    if (error) {
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: errorComment,
      });
      core.setFailed(error);
    }
  },
};
