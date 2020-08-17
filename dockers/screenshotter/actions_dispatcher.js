const SELENIUM_BROWSERS = ["chrome", "firefox"];
const BROWSERSTACK_BROWSERS = [{
    browserName: "safari",
    browser_version: "13.1",
    os: "OS X",
    os_version: "Catalina",
}];

function removeLabel(github, context, label) {
    github.issues.removeLabel({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        name: label,
    });
}

function buildSeleniumJob(name) {
    return {
        browser: name,
        services: {selenium: {
            image: `selenium/standalone-${name}:3.141.59-20200525`,
            ports: ["4444:4444"],
        }},
    };
}

function buildBrowserstackJob(capabilities) {
    return {
        browser: capabilities.browserName,
        services: {},
        browserstack: capabilities,
    };
}

module.exports = (github, context) => {
    const include = [];

    // running selenium doesn't require access to secrets
    if (context.eventName !== "pull_request_target") {
        include.push(...SELENIUM_BROWSERS.map(buildSeleniumJob));
    }

    // check access to Browserstack crendential secrets
    if (context.eventName !== "pull_request" ||
            context.payload.pull_request.head.repo.full_name === "KaTeX/KaTeX") {
        if (context.eventName === "pull_request_target") {
            removeLabel(github, context, "test screenshots");
        }
        include.push(...BROWSERSTACK_BROWSERS.map(buildBrowserstackJob));
    }

    return {browser: include.map(b => b.browser), include};
};
