#region credits
// ***********************************************************************
// Assembly	: DemoApplication.Core
// Author	: Rod Johnson
// Created	: 03-16-2013
// 
// Last Modified By : Rod Johnson
// Last Modified On : 03-17-2013
// ***********************************************************************
#endregion
namespace DemoApplication.Core.Services
{
    #region

    using Interfaces.Data;
    using Interfaces.Service;
    using Model;

    #endregion

    public partial class PersonService : BaseService<Person>, IPersonService
    {
		protected new IPersonRepository Repository;				
		
		public PersonService(IUnitOfWork unitOfWork, IPersonRepository personRepository)
			:base(unitOfWork)
		{
		    base.Repository = Repository = personRepository;
		}		
	}
}