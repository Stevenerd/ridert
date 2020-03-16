let client=null, contractInstance=null;
let contractAddress="ct_23k6msDWoPh4PhffzaVApZhF7ULsr58isZbVDom847Yr3ASjmT";

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
    requirement(state.admin ==ak_cZqVEBCxWVo3Zq3EHGHuW944LyuMiAS8QF6c1GXMNm2FQACPt, "You are not admin to access this page")
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
  let allRides=document.getElementById("book-a-ride-form");

  let newRideDiv=document.createElement("div");
  newRideDiv.classList.add("ride");

  let rideFirstNameParagraph=document.createElement("p");
  rideFirstNameParagraph.innerText=firstname;

  let rideSurnameParagraph=document.createElement("p");
  rideSurnameParagraph.innerText=surname;

  let rideEmailParagraph=document.createElement("p");
  rideEmailParagraph.innerText=email;

  let rideMobileParagraph=document.createElement("p");
  rideMobileParagraph.innerText=mobile;

  let rideLocationParagraph=document.createElement("p");
  rideLocationParagraph.innerText=location;

  let rideDestinationParagraph=document.createElement("p");
  rideDestinationParagraph.innerText=destination;

  newRideDiv.appendChild(rideFirstNameParagraph);
  newRideDiv.appendChild(rideSurnameParagraph);
  newRideDiv.appendChild(rideEmailParagraph);
  newRideDiv.appendChild(rideMobileParagraph);
  newRideDiv.appendChild(rideLocationParagraph);
  newRideDiv.appendChild(rideDestinationParagraph);
  
  allRides.appendChild(newRideDiv);
}

window.addEventListener('load',async function(){
  client=await Ae.Aepp();
  contractInstance=await client.getContractInstance(contractSource,{contractAddress});

  let myRides=(await contractInstance.methods.getUserRides()).decodedResult;
  let allRides=(await contractInstance.methods.getRides()).decodedResult;
  
  myRides.map(ride=>{ 
    rideDom(ride.name,ride.email,ride.mobile,ride.location,ride.destination,ride.rideid);
  });
  allRides.map(ride=>{ 
    rideDom(ride.name,ride.email,ride.mobile,ride.location,ride.destination,ride.rideid);
  });
});

async function newRide(){
  let name=document.getElementById("name").value;
  let email=document.getElementById("email").value;
  let mobile=document.getElementById("mobile").value;
  let location=document.getElementById("location").value;
  let destination=document.getElementById("destination").value;
  let rideid='RA'+(Math.floor(Math.random() * 1001));

  if(name.trim()!=""&&email.trim()!=""&&mobile.trim()!=""&&location.trim()!=""&&destination.trim()!=""){
    await contractInstance.methods.newRide(firstname,surname,email,mobile,location,destination);
    // addRideToDom(firstname,surname,email,mobile,location,destination);
  }
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