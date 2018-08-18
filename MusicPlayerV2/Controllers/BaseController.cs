using Microsoft.AspNetCore.Mvc;
using MusicPlayerV2.API;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicPlayerV2.Controllers
{
    public class BaseController : Controller
    {
        protected T GetErrorResultFromException<T>(Exception ex)
           where T : Result, new()
        {
            return new T()
            {
                Success = false,
                Message = ex.GetType().FullName + " - " + ex.Message
            };
        }

    }
}
