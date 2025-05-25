import React, { useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { db } from '../../database/firebaseConfig';
import { collection, addDoc } from "firebase/firestore";
import type { PracticePair } from "../../types/practice";

const seed: Omit<PracticePair, "id">[] = [
  { word1:"cat",    image1:"https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg", word2:"ate",    image2:"https://classroomclipart.com/images/gallery/Clipart/Food/Breakfast_Clipart/girl-eating-breakfast-cereal-831.jpg", sentence:"cat ate"    },
  { word1:"monkey", image1:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Mantled_howler_monkey_and_baby_%2881337%292.jpg/960px-Mantled_howler_monkey_and_baby_%2881337%292.jpg", word2:"jumps",  image2:"https://i.pinimg.com/474x/9c/80/81/9c80817ac410c6e56de48aec3d0f411c.jpg", sentence:"monkey jumps" },
  { word1:"dog",    image1:"https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*", word2:"barked", image2:"https://www.shutterstock.com/image-vector/cute-dog-domestic-pet-woofing-600nw-2263648663.jpg", sentence:"dog barked"  },
  { word1:"bird",   image1:"https://cdn.britannica.com/10/250610-050-BC5CCDAF/Zebra-finch-Taeniopygia-guttata-bird.jpg", word2:"sings",  image2:"https://media.istockphoto.com/id/937048674/vector/vector-illustration-of-kids-making-art-performance.jpg?s=612x612&w=0&k=20&c=sOhMafkCCvOSzMwrraGv1l2m_mtXiKnYK75Wk3wcEBE=", sentence:"bird sings"  },
  { word1:"fish",   image1:"https://static.vecteezy.com/system/resources/thumbnails/008/721/059/small_2x/cute-fish-at-the-bottom-of-sea-fish-underwater-clipart-vector.jpg", word2:"swims",  image2:"https://media.istockphoto.com/id/1403823619/vector/kid-swim-under-water-on-summer-holiday.jpg?s=612x612&w=0&k=20&c=TAxHh1ollKQcy4mhQYSqTDj2UbqiJFSImW4xNCKPuW4=", sentence:"fish swims"  },
  { word1:"horse",  image1:"https://img.freepik.com/free-vector/brown-horse-cartoon-isolated_1308-141043.jpg?semt=ais_hybrid&w=740", word2:"gallops",image2:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4Y4lickGYoW0wcDgbNYEOaWbfqacUW21WnQ&s", sentence:"horse gallops"},
  { word1:"frog",   image1:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb8vT_v6tWj06SADswd10AmKmbKlsxctddLw&s", word2:"hops",   image2:"https://media.istockphoto.com/id/1018810862/vector/happy-boy-and-girl-jumping-up-over-skipping-ropes-joyful-kids-activity-flat-style-vector.jpg?s=612x612&w=0&k=20&c=KFIYABVVh3gi9o8zHSzz-LBC8kByIMER69QYDXSMHFY=", sentence:"frog hops"   },
  { word1:"cow",    image1:"https://t4.ftcdn.net/jpg/02/58/94/67/360_F_258946740_dBbJY1rhi3x46WZHgkrbf9OxZ1wJiP8B.jpg",    word2:"moos",   image2:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqlpUlizuZv4tj4N3ZNbZGHS8pAuQ9JDJzAQ&s",   sentence:"cow moos"    },
  { word1:"owl",    image1:"https://www.shutterstock.com/image-vector/cartoon-cute-owl-clipart-ico-600nw-2603436479.jpg",    word2:"hoots",  image2:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNLuWlCPKONquI4cwI_48hPswWI1wPST_JCg&s",  sentence:"owl hoots"   },
  { word1:"sheep",  image1:"https://images.template.net/483886/Sheep-Clipart-edit-online.png",  word2:"baas",   image2:"https://media.istockphoto.com/id/1152269467/vector/sheep-bleating-cute-cartoon-farm-animal-making-baa-sound-vector-illustration.jpg?s=612x612&w=0&k=20&c=2lvoGx78EUJofCcWEURo5FLDezfSyBpdWRw481wzHPM=", sentence:"sheep baas"  },
];

export default function SeedPracticePairsScreen() {
  const [status, setStatus] = useState<"idle"|"seeding"|"done"|"error">("idle");

  const seedPairs = async () => {
    setStatus("seeding");
    try {
      const col = collection(db, "practice_pairs");
      for (let p of seed) {
        await addDoc(col, p);
      }
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Seed Practice Pairs</Text>
      {status==="idle" && (
        <Button title="Push 10 pairs to Firestore" onPress={seedPairs} />
      )}
      {status==="seeding" && <Text>Seeding… please wait.</Text>}
      {status==="done"   && <Text>✅ Done! Remove this screen now.</Text>}
      {status==="error"  && <Text>❌ Error. Check console.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow:1, justifyContent:"center", alignItems:"center", padding:20 },
  title:     { fontSize:24, fontWeight:"bold", marginBottom:20 },
});
