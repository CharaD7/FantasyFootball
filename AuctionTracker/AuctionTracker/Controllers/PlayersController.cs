using AuctionTracker.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace AuctionTracker.Controllers
{
    public class PlayersController : ApiController
    {
		public List<Player> Get()
		{
			return new List<Player>() {
				new Player() { ID = 1, FirstName = "Phillip", LastName = "Rivers", FullName = "Rivers, Phillip", NflTeam = "Chargers", Position = "QB" },
				new Player() { ID = 2, FirstName = "Russell", LastName = "Wilson", FullName = "Wilson, Russel", NflTeam = "Seahawks", Position  = "QB" },
				new Player() { ID = 3, FirstName = "Kirk", LastName = "Cousins", FullName = "Cousins, Kirk", NflTeam = "Redskins", Position = "QB" },
				new Player() { ID = 4, FirstName = "Reggie", LastName = "Bush", FullName = "Bush, Reggie", NflTeam = "49ers", Position = "RB" },
			};
		}

		public void Post(Player player)
		{
			// store player
		}
    }
}
