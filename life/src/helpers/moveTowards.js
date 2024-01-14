export function moveTowards(person, destinationPosition, speed) {
  let distanceToTravelX = destinationPosition.x - person.position.x;
  let distanceTOTravelY = destinationPosition.y - person.position.y;
  
  
  let distance = Math.sqrt(distanceToTravelX**2 + distanceTOTravelY**2);

  if (distance <= speed) {
    person.position.x = destinationPosition.x;
    person.position.y = destinationPosition.y;
  } else {
	let normalizedX = distanceToTravelX / distance;
	let normalizedY = distanceTOTravelY / distance;
	
  // updates player position
	person.position.x += normalizedX * speed;
	person.position.y += normalizedY * speed;
	
	distanceToTravelX = destinationPosition.x - person.position.x;
	distanceTOTravelY = destinationPosition.y - person.position.y;
	distance = Math.sqrt(distanceToTravelX**2 + distanceTOTravelY**2);
  }
  
  return distance;	
}