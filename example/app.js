/*global angular */
'use strict';

var val = window.lxvalid,
    personSchema = {
        properties: {
            name: {
                type: 'string',
                required: true,
                minLength: 1
            },
            position: {
                type: 'string',
                maxLength: 20
            },
            email: {
                type: 'string',
                format: 'email'
            },
            homepage: {
                type: 'string',
                format: 'url',
                minLength: 5
            },
            age: {
                type: 'number',
                minimum: 0,
                maximum: 125
            },
            birthdate: {
                type: 'string',
                format: 'date'
            }
        }
    };

angular.module('lxValid', [])
    .controller('demoCtrl', ['$scope', function ($scope) {
        $scope.person = {};

        $scope.$watch('person.name + person.position + person.email + person.homepage + person.age + person.birthdate', function () {
            $scope.result = val.validate($scope.person || {}, personSchema);
        });
    }]);