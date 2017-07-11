"use strict";

const request = require("request-promise-native");

module.exports = exports = {
    addWorklog,
    getAssignedIssues,
    getRecentIssues
};

// adds a new worklog under a particular issue key
function addWorklog(jiraOptions, issueKey, worklog) {
    const urlStub = `issue/${issueKey}/worklog`;
    const options = _getRequestOptions(jiraOptions, urlStub, worklog);

    return request.post(options).
        then((response) => {
            const newWorklogId = response.id;
            return newWorklogId;
        }).
        catch(_handleFailure);
}

// gets the issues assigned to a particular user sorted by date of creation
function getAssignedIssues(jiraOptions) {
    const urlStub = `search?jql=assignee=${jiraOptions.username} ORDER BY createdDate DESC &fields=summary`;
    const options = _getRequestOptions(jiraOptions, urlStub);

    return request.get(options).
        then((response) => {
            const issues = _summarizeIssues(JSON.parse(response));
            return issues;
        }).
        catch(_handleFailure);
}

// gets the issues that a particular user has recently logged time under sorted by date of update
function getRecentIssues(jiraOptions, days) {
    const urlStub = `search?jql=worklogAuthor=${jiraOptions.username}
     AND worklogDate >= -${days}d ORDER BY updatedDate DESC&fields=summary`;
    const options = _getRequestOptions(jiraOptions, urlStub);

    return request.get(options).
        then((response) => {
            const issues = _summarizeIssues(JSON.parse(response));
            return issues;
        }).
        catch(_handleFailure);
}

// generates the options object for HTTP requests
function _getRequestOptions(jiraOptions, urlStub, payload) {
    const url = `${jiraOptions.url}/rest/api/latest/${urlStub}`;
    const {
        username,
        password
    } = jiraOptions;

    return {
        url,
        headers: {
            "Content-Type": "application/json"
        },
        auth: {
            username,
            password
        },
        json: payload
    };
}

// flattens the list of issues to a key-summary list
function _summarizeIssues(data) {
    return data.issues.map((issue) => {
        const {
            key,
            fields: {
                summary
            }
        } = issue;

        return {
            key,
            summary
        };
    });
}

// handles failure of HTTP requests
function _handleFailure(error) {
    return Promise.reject(error);
}