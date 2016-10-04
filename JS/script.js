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
        $.cloudinary.config({ cloud_name: '988555781372168', api_key: 'nEHaU1EwhguJmtSJh2_Ms1UZ2rg'});
        var cache = {};
        $(".contributors").on("click", ".contributor-item", function () {
            parseUserData({
                login: $(this).find("h3").html(),
                downloaded: cache
            });
        });
        $(".modal").on("hidden.bs.modal", function () {
            $(".modal-body, .modal-title").empty();
        });
        $('.register').on('click', function () {
            $('.contributors, .tools').hide();
            $('.register-form').fadeIn();
        });
        $('.return-button').on('click', function () {
            $('.contributors, .tools').fadeIn();
            $('.register-form').hide();
        });
        $('.submit-button').on('click', function () {
            getFieldsFromRegisterForm();
        });
    });

    function getFieldsFromRegisterForm() {
        var contributor = {};
        $('.register-form').find('input').each(function () {
            contributor[$(this).attr('name')] = $(this).val();
        });
        localStorage.setItem(contributor.name, JSON.stringify(contributor));
        console.log(JSON.parse(localStorage.getItem(contributor.name)));
    }

    function getContributorsList() {
        var promise = $.get("https://api.github.com/repos/thomasdavis/backbonetutorials/contributors");
        $.when(promise).done(function (data) {
            data = addLocalStorageFromContributors(data);
            sortContributorsArray(data);
            separateContributorsList(data);
            $(".sort-selector").change(function () {
                $(".contributors").empty();
                data.reverse();
                separateContributorsList(data);
                showContributorsFromType($(".contributor-type").val());

            });
            $(".contributor-type").change(function () {
                showContributorsFromType($(this).val());
            })
        }).fail(function (data) {
            new PNotify({
                type: 'error',
                title: 'OOPS!',
                text: data.statusText
            });
        });
    }

    function addLocalStorageFromContributors(data) {
        /*localStorage.Storage.forEach(function (localContributor) {
            data.push(JSON.parse(localContributor));
        });*/
        $.each(localStorage, function (key, value) {
           data.push(JSON.parse(value));
        });
        return data;
    }

    function separateContributorsList(arrContributors) {
        arrContributors.forEach(function (userInformation) {
            setGroupStatus(userInformation);
            createContributorElement(userInformation);
        })

    }

    function createContributorElement(person) {
        $(".contributors").append('<div class="contributor-item ' + person.group + '"><img src="' + person.avatar_url + '" class="img-circle contributor">' +
            '<h3>' + person.login + '</h3><div/>');
    }

    function setGroupStatus(person) {
        if (person.contributions > GroupLimits.gold.minValue) {
            person.group = GroupLimits.gold.name;
        }
        else if (person.contributions > GroupLimits.silver.minValue) {
            person.group = GroupLimits.silver.name;
        }
        else {
            person.group = GroupLimits.bronze.name;
        }
    }

    function showContributorsFromType(group) {
        if (group === "all") {
            $(".contributors").children().show();
        } else {
            $(".contributors").children().hide();
            $("." + group).show();
        }
    }

    function sortContributorsArray(arr) {
            arr.sort(function (a, b) {
                if (a.login.toLowerCase() > b.login.toLowerCase()) {
                    return 1;
                }
                return -1;
            });
    }

    function parseUserData(options) {
        var login = options.login;
        if (!options.downloaded[login]){
            var promise = $.get("https://api.github.com/users/" + login);
            $.when(promise).done(function (data) {
                $(".modal").modal("show");
                options.downloaded[login] = data;
                fillModalWindowFields(data);
            }).fail(function (data) {
                new PNotify({
                    type: 'error',
                    title: 'OOPS!',
                    text: data.statusText
                });
            });
        } else {
            $(".modal").modal("show");
            fillModalWindowFields(options.downloaded[login]);
        }
    }

    function generateModalFilling(user) {
        console.log(user);
        var filling = (user.name != undefined) ? '<p>Name: ' + capitalizeFirstLetter(user.name) + '</p>' : '';
        filling += (user.company != undefined) ? '<p>Company: ' + capitalizeFirstLetter(user.company) + '</p>' : '';
        filling += (user.blog != undefined) ? '<p>Blog: <a href="'+ user.blog +'" target="_blank">'+ user.blog +'</a></p>' : '';
        filling += (user.email != undefined) ? '<p>Email: <a href="mailto:' + user.email + '">' + user.email + '</a></p>' : '';
        filling += (user.location != undefined) ? '<p>Location: ' + user.location + "</p>" : '';
        var image = '<img src="' + user.avatar_url + '"> ';
        var failString = 'There is no information about this user';
        if (filling === '') return image + failString;
        return image + filling;
    }

    function fillModalWindowFields(user) {
        $(".modal-title").html("Information about: " + user.login);
        $(".modal-body").html(generateModalFilling(user));
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }



})();