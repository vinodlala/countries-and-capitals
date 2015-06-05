'use strict';

angular.module('cacApp', ['ngRoute', 'ngAnimate'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: './home.html'
            })
            .when('/countries', {
                templateUrl: './countries.html',
                controller: 'countriesCtrl'
            })
            .when('/countries/:country', {
                templateUrl: './country.html',
                controller: 'countryCtrl',
                resolve: {

                    //country: function (getCapital, getCountry, $route) {
                    //    return getCountry($route.current.params.country)
                    //        .then(function (country) {
                    //            return getCapital(country);
                    //        });
                    //},
                    //
                    //neighbors: function (getNeighbors, $route) {
                    //    return getNeighbors($route.current.params.country);
                    //}


                    country: function (getCountry, $route) {
                        return getCountry($route.current.params.country);
                    }
                    //capital: function (getCapital, $route) {
                    //    return getCapital($route.current.params.country);
                    //return getCapital(country);
                    //},
                    //neighbors: function (getNeighbors, $route) {
                    //    return getNeighbors($route.current.params.country);
                    //}

                }
            })

            .when('/error', {
                templateUrl: './error.html'
            })
            .otherwise('/error', {
                templateUrl: './error.html'
            })
        ;
    }])

    .
    run(function ($rootScope, $location, $timeout) {
        $rootScope.$on('$routeChangeError', function () {
            $location.path("/error");
        });
        $rootScope.$on('$routeChangeStart', function () {
            $rootScope.isLoading = true;
        });
        $rootScope.$on('$routeChangeSuccess', function () {
            $timeout(function () {
                $rootScope.isLoading = false;
            }, 1000);
        });
    })

    // use these more
    .constant('API_PREFIX', 'http://api.geonames.org')

    .constant('LIST_COUNTRIES', '/countryInfoJSON?')
    .constant('NEIGHBOURS', '/neighboursJSON?')
    .constant('SEARCH', '/searchJSON?')

    .constant('USER_NAME', 'username=vinod_lala')
    .constant('COUNTRY', 'country=')

    .factory('getCountries', function ($http, $q, API_PREFIX, LIST_COUNTRIES, USER_NAME) {
        return function () {
            return $http.get(API_PREFIX + LIST_COUNTRIES + USER_NAME, {cache: true})
                .then(function (response) {
                    return response.data.geonames;
                })
                .catch(function (response) {
                    console.log('response.status: ' + response.status);
                });
        }
    })
    .factory('getCountry', function (getCountries, $route) {
        return function (countryName) {
            return getCountries()
                .then(function (countries) {
                    var countryResult, i;
                    for (i = 0; i < countries.length; i++) {
                        if (countries[i].countryName === countryName) {
                            countryResult = countries[i];
                            break;
                        }
                    }
                    return countryResult;
                })
                .then(console.log("after"));
            //.then(getCapital)
        }
    })
    //.factory('getCapital', function ($http, $q, API_PREFIX, SEARCH, USER_NAME) {
    .factory('getCapital', function ($http, $q, API_PREFIX, SEARCH, USER_NAME, getCountry) {
        var path = 'http://api.geonames.org/searchJSON?';
        return function (countryName) {
            console.log("factory getCapital countryName");
            console.log(countryName);
            var country = getCountry(countryName);
            console.log("factory getCapital country after getCountry(countryName)");

            console.log(country);
            var request = {
                q: country.capital,
                country: country.countryCode, // two-character country code
                //featurecode: 'pplc', //capital of a political entity
                fcode: 'pplc', //capital of a political entity
                username: 'vinod_lala'
            };
            return $http({
                method: 'GET',
                url: path,
                cache: true,
                params: request
            }).then(function (response) {
                return response.data.geonames[0];
            })
        }
    })
    .factory('getNeighbors', ['$http', '$location', function ($http, $location) {
        var i;
        //debugger;
        //var getNeighbors = function (countryName) {
        return function (country) {
            //debugger;
            var neighbors = [];
            // do I really need geonameId?
            //var geoId = countryInfo.getCountry(country).geonameId;
            //debugger;
            var path = 'http://api.geonames.org/neighboursJSON?';
            var request = {
                //geonameId: geoId,
                geonameId: country.geonameId,
                country: country.name,
                username: 'vinod_lala'
            };
            if (country.name == 'Antarctica') {
                neighbors = [];
            } else {
                $http({
                    method: 'GET',
                    url: path,
                    cache: true,
                    params: request
                })
                    .success(function (data) {
                        debugger;
                        if (data.geonames.length === 0) {
                            neighbors = [];
                        } else {
                            for (i = 0; i < data.geonames.length; i++) {
                                //debugger;
                                neighbors[i] = data.geonames[i].countryName;
                            }
                        }

                    })
                    .error(function (data, status) {
                        console.log('Error status: ' + status);
                        $location.path('/error');
                    });
            }
            //debugger;
            return neighbors;
            //debugger;
        };
        //return {
        //    getNeighbors: getNeighbors
        //};
    }])


    //.factory('countryInfo', ['$location', '$http', 'API_PREFIX', 'LIST_COUNTRIES', 'USER_NAME',
    //    function ($location, $http, API_PREFIX, LIST_COUNTRIES, USER_NAME) {
    //        var countries = [];
    //        var countryResult = {};
    //        var path = API_PREFIX + LIST_COUNTRIES + USER_NAME;
    //        var i;
    //        $http.get(path, {cache: true})
    //            .success(function (data) {
    //                for (i = 0; i < data.geonames.length; i++) {
    //                    countries[i] = data.geonames[i];
    //                }
    //            })
    //            .error(function (data, status) {
    //                console.log('Error status: ' + status);
    //                $location.path('/error');
    //            });
    //
    //        function getCountries() {
    //            return countries;
    //        }
    //
    //        function getCountry(countryName) {
    //            // has to be a better way to search through array
    //            for (i = 0; i < countries.length; i++) {
    //                if (countries[i].countryName === countryName) {
    //                    countryResult = countries[i];
    //                    break;
    //                }
    //            }
    //            return countryResult;
    //        }
    //
    //        return {
    //            getCountries: getCountries,
    //            getCountry: getCountry
    //        };
    //    }])

    //.factory('capitalPopulation', ['countryInfo', 'countryNeighbors', '$http', '$location', function (countryInfo, countryNeighbors, $http, $location) {
    //    var getCapitalPopulation = function (countryCode, capital) {
    //        //debugger;
    //        var capitalPopulation = 0;
    //        var path = 'http://api.geonames.org/searchJSON?';
    //        var request = {
    //            q: capital,
    //            country: countryCode, // two-character country code
    //            //featurecode: 'pplc', //capital of a political entity
    //            fcode: 'pplc', //capital of a political entity
    //            username: 'vinod_lala'
    //        };
    //        $http({
    //            method: 'GET',
    //            url: path,
    //            cache: true,
    //            params: request
    //        })
    //            .success(function (data) {
    //                //debugger;
    //                if (capital) {
    //                    //debugger;
    //                    capitalPopulation = data.geonames[0].population;
    //                    //debugger;
    //                } else {
    //                    //debugger;
    //                    capitalPopulation = 0;
    //                    //debugger;
    //                }
    //            })
    //            .error(function () {
    //                console.log('Error status: ' + status);
    //                $location.path('/error');
    //            });
    //        //debugger;
    //        return capitalPopulation;
    //        //debugger;
    //    };
    //    return {
    //        getCapitalPopulation: getCapitalPopulation
    //    };
    //}])

    //.factory('countryNeighbors', ['$http', 'countryInfo', '$location', function ($http, countryInfo, $location) {
    //    var i;
    //    //debugger;
    //    var getNeighbors = function (countryName) {
    //        //debugger;
    //        var neighbors = [];
    //        // do I really need geonameId?
    //        var geoId = countryInfo.getCountry(countryName).geonameId;
    //        //debugger;
    //        var path = 'http://api.geonames.org/neighboursJSON?';
    //        var request = {
    //            geonameId: geoId,
    //            country: countryName,
    //            username: 'vinod_lala'
    //        };
    //        if (countryName == 'Antarctica') {
    //            neighbors = [];
    //        } else {
    //            $http({
    //                method: 'GET',
    //                url: path,
    //                cache: true,
    //                params: request
    //            })
    //                .success(function (data) {
    //                    //debugger;
    //                    if (data.geonames.length === 0) {
    //                        neighbors = [];
    //                    } else {
    //                        for (i = 0; i < data.geonames.length; i++) {
    //                            //debugger;
    //                            neighbors[i] = data.geonames[i].countryName;
    //                        }
    //                    }
    //
    //                })
    //                .error(function (data, status) {
    //                    console.log('Error status: ' + status);
    //                    $location.path('/error');
    //                });
    //        }
    //        //debugger;
    //        return neighbors;
    //        //debugger;
    //    };
    //    return {
    //        getNeighbors: getNeighbors
    //    };
    //}])

    .controller('countriesCtrl', ['$scope', '$location', 'getCountries',
        function ($scope, $location, getCountries) {
            getCountries()
                .then(function (countries) {
                    $scope.countries = countries;
                });
            $scope.goToCountry = function (countryName) {
                $location.path('/countries/' + countryName);
            }
        }])

    //.controller('countryCtrl', function ($scope, country, capital) {
    .controller('countryCtrl', function ($scope, country) {
        debugger;
        console.log("in countryCtrl, country is:");
        console.log(country);
        $scope.country = country;
        //console.log("controller capital:");
        //console.log(capital);
        //$scope.country = capital;

    })
    //.controller('countryCtrl', ['$scope', 'countryInfo', 'countryNeighbors', 'capitalPopulation', '$routeParams',
    //    function ($scope, countryInfo, countryNeighbors, capitalPopulation, $routeParams) {
    //
    //        //debugger;
    //        var country = countryInfo.getCountry($routeParams.country);
    //        $scope.country = country;
    //        //debugger;
    //        $scope.country.neighbors = countryNeighbors.getNeighbors(country.countryName);
    //        //debugger;
    //        $scope.country.capitalPopulation = capitalPopulation.getCapitalPopulation(country.countryCode, country.capital);
    //        //debugger;
    //    }])

;