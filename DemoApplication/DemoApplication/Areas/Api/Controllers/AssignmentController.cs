﻿namespace DemoApplication.Areas.Api.Controllers
{
    using Infrastructure.Data;
    using Models;
    using System.Data;
    using System.Linq;
    using System.Web.Http;
    using Helpers;

    public class AssignmentController : ApiController
    {
        public Assignment Get(int id)
        {
            using (var db = new DapperDatabase())
            {
                var result = db.Connection.QueryMultiple("Assignment_GetById", new { Id = id }, commandType: CommandType.StoredProcedure);

                var assignment = result.Read<Assignment>().Single();

                db.Connection.LogActivity(ActivityActions.View, id);

                return assignment;
            }
        }

        public dynamic Get(int id, string employeeId)
        {
            using (var db = new DapperDatabase())
            {
                var result = db.Connection.QueryMultiple("Assignment_GetByIdEmployeeId",
                                                         new { Id = id, EmployeeId = employeeId },
                                                         commandType: CommandType.StoredProcedure);

                var dataResult = new
                {
                    Assignment = result.Read<Assignment>().Single(),
                    Activity = result.Read<Activity>().ToList()
                };


                db.Connection.LogActivity(ActivityActions.View, id);

                return dataResult;
            }
        }

        public int Put(Assignment entity)
        {
            using (var db = new DapperDatabase())
            {
                int id = (int)db.Connection.Query<decimal>("Assignment_Add", entity, commandType: CommandType.StoredProcedure).First();

                db.Connection.LogActivity(ActivityActions.Create, id);

                return id;
            }
        }

        [HttpPut]
        public int AddFromTask(AssignmentSave entity)
        {
            using (var db = new DapperDatabase())
            {
                var transaction = db.Connection.BeginTransaction();

                int id = (int)db.Connection.Query<decimal>("Employee_AddTask",
                                                           entity,
                                                           commandType: CommandType.StoredProcedure,
                                                           transaction: transaction).First();

                db.Connection.LogActivity(ActivityActions.Create, id, transaction: transaction);

                transaction.Commit();

                return id;
            }
        }

        public int Post(Assignment entity)
        {
            using (var db = new DapperDatabase())
            {
                int id = db.Connection.Execute("Assignment_Update", entity, commandType: CommandType.StoredProcedure);

                db.Connection.LogActivity(ActivityActions.Update, entity.Id);

                return id;
            }
        }

        public void Delete(int id)
        {
            using (var db = new DapperDatabase())
            {
                db.Connection.Execute("Assignment_Delete", new { Id = id }, commandType: CommandType.StoredProcedure);

                db.Connection.LogActivity(ActivityActions.Delete, id);
            }
        }

        [HttpPost]
        public Assignment Complete(int id, string employeeId)
        {
            using (var db = new DapperDatabase())
            {
                var assignment = db.Connection.Query<Assignment>("Assignment_Complete",
                                                       new { Id = id, EmployeeId = employeeId },
                                                       commandType: CommandType.StoredProcedure).First();

                db.Connection.LogActivity(ActivityActions.Complete, id);

                return assignment;
            }
        }
    }
}
