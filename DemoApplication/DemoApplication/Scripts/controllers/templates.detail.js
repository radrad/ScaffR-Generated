﻿Application.Controllers.controller('templates.detail',
            ['$scope', '$routeParams', 'service.template', 'service.task', 'service.principal', 'service.department', 'service.category', 'service.milestone', 'commonUtils', 'toastr',
    function ($scope, $routeParams, serviceTemplate, serviceTask, servicePrincipal, serviceDepartment, serviceCategory, serviceMilestone, commonUtils, toastr) {

        $scope.isEdit = $routeParams.id == 0;

        $scope.$parent.backLinkText = 'Dashboard';

        servicePrincipal.getAll(function (data) {
            $scope.assignables = data;

            if ($routeParams.id == 0) {
                $scope.template = {
                    name: '',
                    description: '',
                    activity: [],
                    tasks: []
                };
            } else {
                serviceTemplate.getById($routeParams.id, function (data) {
                    $scope.template = data;
                    $scope.template.positions = [];
                });
            }
        });

        $scope.positions = ['IT Manager', 'Sales Representative', 'Sales Manager', 'Web Developer'];

        serviceDepartment.getAll(function (data) {
            $scope.departments = data;
        });

        serviceCategory.getAll(function (data) {
            $scope.categories = data;

            var newTasks = {};
            _.forEach($scope.categories, function (item) {
                newTasks[item.id] = [];
            });

            $scope.newTasks = newTasks;
        });

        serviceMilestone.getAll(function (data) {
            $scope.milestones = data;
        });

        serviceTask.getAvailable(function (data) {
            $scope.availableTasks = data;
        });

        //templates.individual(function (data) {

        //    $scope.availableTasks = groupItems(data.availableTasks, 'categoryId');
        //    $scope.assignables = groupItems(data.assignables, 'department');
        //    $scope.milestones = data.milestones;
        //    $scope.templateAssignables = groupItems(data.templateAssignables, 'department');

        //    console.log('milestones', $scope.milestones);
        //});

        function groupItems(taskList, group) {
            group = group || 'category';

            var result = {
                categories: [],
                group: {}
            };

            _.forEach(taskList, function (item) {

                if (!result.group[item[group]]) {
                    result.group[item[group]] = [];
                    result.categories.push(item[group]);
                }

                result.group[item[group]].push(item);
            });

            return result;
        }

        //
        // Filtering

        $scope.filter = {
            assignees: [],
            period: undefined
        };

        $scope.assignees = [];
        $scope.periods = [
            { name: 'Today', func: 'dayOfYear' },
            { name: 'This Week', func: 'week' },
            { name: 'This Month', func: 'month' }
        ];

        $scope.$watch('template.tasks', function (newValue) {
            if (!newValue || newValue.length == 0) return;

            var result = [];
            _.forEach($scope.periods, function (item) {
                item.count = 0;
            });

            _.forEach(newValue, function (item) {

                // Handle period counts
                _.forEach($scope.periods, function (period) {
                    if (moment()[period.func]() != moment(item.due)[period.func]()) return;

                    period.count += 1;
                });

                // Handle assignees counts
                var assignee = _.findWhere(result, { id: item.principalId });
                if (assignee) {
                    assignee.count += 1;
                    return;
                }

                if (!$scope.assignables) return;

                var principal = _.find($scope.assignables, function (p) { return p.id == item.principalId; });
                if (!principal) return;

                result.push({ id: principal.id, name: principal.name, count: 1 });
            });

            $scope.assignees = result;
        }, true);

        //
        // Add new task

        $scope.isAddingTask = false;

        $scope.addNewTask = function (categoryId) {
            $scope.isAddingTask = true;

            $scope.newTasks[categoryId].push(
                {
                    "name": null,
                    "categoryId": categoryId,
                    "principalId": null,
                    "interval": null,
                    "value": null,
                    "isBefore": null,
                    "milestone": null,
                    "templateId": $scope.template.id
                });
        };

        $scope.saveTask = function (task) {
            $scope.template.tasks.push(task);
            $scope.deleteTask(task, true);
        };

        $scope.deleteTask = function (task, isNew) {
            if (isNew) {
                commonUtils.removeFromList(task, $scope.newTasks[task.categoryId]);
                $scope.isAddingTask = false;
            } else {
                serviceTask.delete(task.id, function () {
                    commonUtils.removeFromList(task, $scope.template.tasks);
                    $scope.isAddingTask = false;

                    toastr.success('Deleted.');
                });
            }
        };

        //
        // Template Assignables

        $scope.setTemplateAssignable = function (assignable) {
            serviceTemplate.addDepartment($scope.template.id, assignable.id, function () {
                $scope.template.departments.push(assignable);
            });
        };

        $scope.removeTemplateAssignable = function (assignable, index) {
            serviceTemplate.deleteDepartment($scope.template.id, assignable.id, function () {
                $scope.template.departments.splice(index, 1);
            });
        };

        $scope.setPosition = function (position) {
            $scope.template.positions.push(position);
        };

        $scope.removePosition = function (position, index) {
            $scope.template.positions.splice(index, 1);
        };

        $scope.applyTemplate = function (department) {
            serviceTemplate.applyToDepartment($scope.template.id, department.id, function () {
                toastr.success('Applied Successfully');
                department.isApplied = true;
            });
        };

        //
        // Global Actions

        $scope.switchMode = function () {
            $scope.isEdit = !$scope.isEdit;
        };

        $scope.saveChanges = function () {
            toastr.success('Saved.');
            $scope.isEdit = false;
        };

        $scope.goBack = function () {
            window.history.back();
        };

    }]);