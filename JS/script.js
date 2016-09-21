$(document).ready(function () {
        getContributorsList();
    }
);


function getContributorsList() {
    var promise = $.get("https://api.github.com/repos/thomasdavis/backbonetutorials/contributors");
    $.when(promise).done(function () {
        $(".list").attr("size", promise.responseJSON.length);
        separateContributorsList(promise.responseJSON)
    })
}

function separateContributorsList(object) {
    object.forEach(function (element) {
        createContributorElement(element);
    })

}

function createContributorElement(person) {
    $(".list").append('<option>' + person.login + '</option>');
}