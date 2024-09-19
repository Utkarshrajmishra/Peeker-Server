import { Client, Databases, Query } from "appwrite";

export const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.PROJECT_ID);

const databases = new Databases(client);

export default async (req, res) => {
  
  const id = req.query.text || req.body.text;

  if (!id)
    return res.status(400).json({ error: "No image text provided" });

  try {
    const result = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      [Query.equal("id", id),Query.select(["seen"])] 
    );

      if (result.total === 0) {
        return res
          .status(400)
          .json({ error: "No document found with the given id" });
      }

      const status=result.documents[0].seen;
      if(status) return res.status(404).json({ error: "Nothing found" });


      const documentId = result.documents[0].$id;

      try {
        const update = await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_COLLECTION_ID,
          documentId,
          {
            "seen":true,
            seenAt:new Date(),
          }
        );

        return res.status(404).json({error:'Nothing found'})
      } catch (error) {
        return res.status(500).json({error:"Some error occurred while updating"})
      }


  } catch (error) {
    return res.status(500).json({ error: "Some error occurred while fetching" });
  }
};
