﻿Application.Controllers.controller('templates.detail',
            ['$scope', '$location', '$routeParams', 'service.template', 'service.task', 'service.principal', 'service.department', 'service.category', 'service.milestone', 'commonUtils', 'toastr',
    function ($scope, $location, $routeParams, serviceTemplate, serviceTask, servicePrincipal, serviceDepartment, serviceCategory, serviceMilestone, commonUtils, toastr) {
        $scope.isEdit = false;
        $scope.isNew = false;
        $scope.$parent.backLinkText = 'Dashboard';

        servicePrincipal.getAll(function (data) {
            $scope.assignables = data;

            if ($routeParams.id == 'new') {
                $scope.isEdit = true;
                $scope.isNew = true;
                $scope.template = {
                    id: 0,
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

            var task = serviceTask.getEmpty();
            task.templateId = $scope.template.id;
            task.categoryId = categoryId;

            $scope.newTasks[categoryId].push(task);
        };

        $scope.saveTask = function (task) {
            serviceTask.add(task, function (id) {
                $scope.deleteTask(task, true);

                task.id = id;
                $scope.template.tasks.push(task);

                toastr.success("New Task Added");
            });
        };

        $scope.deleteTask = function (task, isNew) {
            if (isNew) {
                commonUtils.removeFromList(task, $scope.newTasks[task.categoryId]);
                $scope.isAddingTask = false;
            } else {
                serviceTask.delete(task.id, function () {
                    commonUtils.removeFromList(task, $scope.template.tasks);
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

        var templateClone = {};
        $scope.editMode = function () {
            $scope.isEdit = true;
            cloneTemplate($scope.template, templateClone);
        };

        $scope.saveChanges = function () {
            cloneTemplate($scope.template, templateClone);

            if (templateClone.id == 0)
                serviceTemplate.add(templateClone, function (id) {
                    $location.path('/templates/detail/' + id);
                    toastr.success('Saved');
                });
            else
                serviceTemplate.update(templateClone, function () {
                    $scope.isEdit = false;
                    toastr.success('Updated');
                });
        };

        $scope.cancel = function () {
            $scope.isEdit = false;
            cloneTemplate(templateClone, $scope.template);
        };

        function cloneTemplate(input, output) {
            output.id = input.id;
            output.name = input.name;
            output.description = input.description;
        }
    }]);