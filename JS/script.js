(function () {
    $(document).ready(function () {
            getContributorsList();
        }
    );


    function getContributorsList() {
        var promise = $.get("https://api.github.com/repos/thomasdavis/backbonetutorials/contributors");
        $.when(promise).done(function (data) {
            console.log(data);
            window.contibutors = data;
            $(".list").attr("size", data.length);
            separateContributorsList(data);
        })
    }

    function separateContributorsList(object) {
        object.forEach(function (element) {
            createContributorElement(element);
        })

    }

    function createContributorElement(person) {
        $(".container").append('<div class="contributor-item"><img src="' + person.avatar_url + '" class="img-circle contributor">' +
            '<h3>' + person.login + '</h3><div/>');
    }
})();