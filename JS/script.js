(function () {

    var GroupLimits = {
        gold: {
            minValue: 50,
            name: 'gold'
        },
        silver: {
            minValue: 5,
            name: 'silver'
        },
        bronze: {
            name: 'bronze'
        }
    };

    $(document).ready(function () {
        getContributorsList();
    });

    function getContributorsList() {
        var promise = $.get("https://api.github.com/repos/thomasdavis/backbonetutorials/contributors");
        $.when(promise).done(function (data) {
            sortContributorsArray(data);
            separateContributorsList(data);
            $(".sort-selector").change(function () {
                $(".contributors").html("");
                sortContributorsArray(data);
                separateContributorsList(data);
                showContributorsFromType($(".contributor-type").val());

            });
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
        $(".contributors").append('<div class="contributor-item ' + person.group + '"><img src="' + person.avatar_url + '" class="img-circle contributor">' +
            '<h3>' + person.login + '</h3><div/>');
    }

    function setGroupStatus(person) {
        if(person.contributions > GroupLimits.gold.minValue) person.group = GroupLimits.gold.name;
        else if(person.contributions > GroupLimits.silver.minValue) person.group = GroupLimits.silver.name;
        else person.group = GroupLimits.bronze.name;
    }

    function showContributorsFromType(group) {
        if(group === "all") {
            $(".contributors").children().show();
        } else {
            $(".contributors").children().hide();
            $("." + group).show();
        }
    }

    function sortContributorsArray(arr) {
        var sortType = $(".sort-selector").val();
        if(sortType == "asc") {
            arr.sort(function (a, b) {
                if (a.login.toLowerCase() > b.login.toLowerCase()) {
                    return 1;
                } else {
                    return -1;
                }
            });
        }
        if(sortType == "desc") {
            arr.sort(function (a, b) {
                if (a.login.toLowerCase() < b.login.toLowerCase()) {
                    return 1;
                } else {
                    return -1;
                }
            });
        }
    }


})();