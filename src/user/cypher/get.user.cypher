MATCH (u:User {uuid: $1})
MATCH (u)-[:RANK]->(r)
OPTIONAL MATCH (u)-[:SOCIAL_MEDIA]->(s)

OPTIONAL MATCH (u)-[:BADGE]->(b)
OPTIONAL MATCH (u)-[:LEFT_BADGE]->(left_b)
OPTIONAL MATCH (u)-[:RIGHT_BADGE]->(right_b)

OPTIONAL MATCH (likedUser:User)-[:LIKES]->(u)
OPTIONAL MATCH (u)-[:INVITED]->(invitedUser)
return u {.uuid, .name, .minecraftVersion, .active, .firstNameTag, .secondNameTag, .nameTagBanned, .color, .about, .serverPartner, rank: properties(r), badges: collect(b), leftBadge: properties(left_b), rightBadge: properties(right_b), likes: count(likedUser), invites: count(invitedUser) }
