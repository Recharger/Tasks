(function () {
    $(document).ready(function () {
        getContributorsList();
    });


    function getContributorsList() {
        var promise = $.get("https://api.github.com/repos/thomasdavis/backbonetutorials/contributors");
        $.when(promise).done(function (data) {
            separateContributorsList(data);
            $(".contributor-type").change(function () {
                showContributorsFromType($(this).val());
            })
        })
    }

    function separateContributorsList(object) {
        object.forEach(function (element) {
            setGroupStatus(element);
            createContributorElement(element);
        })

    }

    function createContributorElement(person) {
        $(".contributors-" + person.group).append('<div class="contributor-item ' + person.group + '"><img src="' + person.avatar_url + '" class="img-circle contributor">' +
            '<h3>' + person.login + '</h3><div/>');
    }

    function setGroupStatus(person) {
        if(person.contributions > 50) person.group = 'gold';
        else if(person.contributions > 5) person.group = 'silver';
        else person.group = 'bronze';
    }

    function showContributorsFromType(group) {
        if(group === "all") {
            $(".contributors-gold, .contributors-silver, .contributors-bronze").show();
        } else {
            $(".contributors-gold").hide();
            $(".contributors-silver").hide();
            $(".contributors-bronze").hide();
            $(".contributors-" + group).show();
        }
    }
})();