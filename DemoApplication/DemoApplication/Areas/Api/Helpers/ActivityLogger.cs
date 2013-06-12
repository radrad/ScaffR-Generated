﻿namespace DemoApplication.Areas.Api.Helpers
{
    using Infrastructure.Data;
    using Models;
    using System.Data;
    using System.Data.Common;

    public static class ActivityLogger
    {
        public static void LogActivity(this DbConnection connection, string action,
                                       int? assignmentId = null,
                                       int? taskId = null,
                                       int? templateId = null,
                                       string teamId = null)
        {
            // TODO: Get ID from the logged in user
            var activity = new ActivitySave
            {
                Action = action,
                AssignmentId = assignmentId,
                TaskId = taskId,
                TemplateId = templateId,
                TeamId = teamId,
                UserId = "KVQE0AP835ET10S8W7EB94EEDTO69A"
            };

            try
            {
                connection.Execute("Activity_Log", activity, commandType: CommandType.StoredProcedure);
            }
            catch { }
        }
    }
}