let client=null, contractInstance=null;
let contractAddress="ct_S3eXwFHayN5cGshhQCLAPP2iU9dquPrZAjum71Btv9aw1pdaz";

let contractSource=`
contract RideArt =
   
  record ride =
    { customersAddress : address,
      name             : string,
      email            : string, 
      mobile           : int,
      currentlocation  : string,
      destination      : string }
      
  record state =
    { rides        : map(string, ride),
      userRides    : map(address, list(ride)),
      admin        : address }
      
  entrypoint init() =
    { rides = {},
      userRides = {},
      admin = Call.caller }

  function requirement(exp : bool, err : string) =
    if(!exp)
     abort(err)

  entrypoint onlyAdmin() : bool =
    requirement(state.admin ==ak_2kZrMMEMmSZg6wJbnykv2wXuxifz5rD7gBAshqNXbAa6rDSs5G, "You are not admin to access this page")
    true

  stateful entrypoint newRide(name' : string, email' : string, mobile' : int, currentlocation' : string, destination': string, rideid: string)=                                           
    let ride = { customersAddress = Call.caller, name   = name', email    = email', mobile    = mobile', currentlocation     = currentlocation', destination = destination'}

    let userRideList=Map.lookup_default(Call.caller,state.userRides,[])
    let newUserRideList=ride::userRideList

    put(state{ rides[rideid] = ride, userRides[Call.caller] = newUserRideList })

  entrypoint getUserRides()=
   Map.lookup_default(Call.caller, state.userRides,[])

  entrypoint getRide(rideid : string) : ride =
    onlyAdmin()
    switch(Map.lookup(rideid, state.rides))
      None    => abort("There was no ride registered with this id.")
      Some(x) => x

  entrypoint getRides()=
   onlyAdmin()
   state.rides
`;

function rideDom(name,email,mobile,location,destination,rideid){
  let allRides=document.getElementById("ride-dom");

  let card=document.createElement("div");
  card.classList.add("card");

  let cardBody=document.createElement("div");
  cardBody.classList.add("card-body");

  let rideIdText=document.createElement("h5");
  rideIdText.innerText="<b>Ride Id<b>: " + rideid;

  let nameText=document.createElement("p");
  nameText.innerText="<b>Name<b>: " + name;

  let emailText=document.createElement("p");
  emailText.innerText="<b>Email<b>: " + email;

  let mobileText=document.createElement("p");
  mobileText.innerText="<b>Mobile<b>: " + mobile;

  let locationText=document.createElement("p");
  locationText.innerText="<b>Location<b>: " + location;

  let destinationText=document.createElement("p");
  destinationText.innerText="<b>Destination<b>: " + destination;

  cardBody
  .appendChild(rideIdText);
  cardBody
  .appendChild(nameText);
  cardBody
  .appendChild(emailText);
  cardBody
  .appendChild(mobileText);
  cardBody
  .appendChild(locationText);
  cardBody
  .appendChild(destinationText);
  
  card.appendChild(cardBody);
  allRides.appendChild(card);
}

window.addEventListener('load',async function(){
  client=await Ae.Aepp();
  contractInstance=await client.getContractInstance(contractSource,{contractAddress});

  let myRides=(await contractInstance.methods.getUserRides()).decodedResult;
  let allRides=(await contractInstance.methods.getRides()).decodedResult;
  console.log('My Rides: ', myRides);
  console.log('All Rides: ', allRides);
  // myRides.map(ride=>{ 
  //   rideDom(ride.name,ride.email,ride.mobile,ride.location,ride.destination,ride.rideid);
  // });
  allRides.map(ride=>{ 
    rideDom(ride.name,ride.email,ride.mobile,ride.location,ride.destination,ride.rideid);
  });
  $("#loader").hide();
});

async function newRide(){
  $("#loader").show();

  let name=document.getElementById("name").value;
  let email=document.getElementById("email").value;
  let mobile=document.getElementById("mobile").value;
  let location=document.getElementById("location").value;
  let destination=document.getElementById("destination").value;
  let rideid='RA'+(Math.floor(Math.random() * 1001));

  if(name.trim()!=""&&email.trim()!=""&&mobile.trim()!=""&&location.trim()!=""&&destination.trim()!=""){
    await contractInstance.methods.newRide(name,email,mobile,location,destination,rideid)
    .then(
      rideDom(name,email,mobile,location,destination,rideid)
    )
    .catch(function (error) {
      console.log(error)
    });
  }
  $("#loader").hide();
}

document.getElementById("submit-ride").addEventListener("click",newRide);

async function searchRide(){
  let rideid=document.getElementById("ride-id").value;

  if(rideid.trim()!=""){
    await contractInstance.methods.getRide(rideid)
    .then()
    .catch(function (error) {
      console.log('Error:', error)
    });
  }
}

document.getElementById("search-ride").addEventListener("click",searchRide);