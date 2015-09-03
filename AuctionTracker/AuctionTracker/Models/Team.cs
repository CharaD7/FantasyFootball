using Newtonsoft.Json;

namespace AuctionTracker.Models
{
	public class Team
	{
		[JsonProperty("id")]
		public int ID { get; set; }
		public string Owner { get; set; }
		public string Name { get; set; }
	}
}