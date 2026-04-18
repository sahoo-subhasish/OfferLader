import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";

export const useActivityMap = (user) => {
    const [activityMap, setActivityMap] = useState({});
    const [currentStreak, setCurrentStreak] = useState(0);
    const [highestStreak, setHighestStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!user) return;

        const fetchActivityMap = async() => {
            try {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const solvedProblems = docSnap.data().solvedProblems || {};

          const activity = {};
          const uniqueDatesSet = new Set();
          
          Object.values(solvedProblems).forEach(p => {
            if (!p?.date) return;
            const dayStr = new Date(p.date).toDateString();
            activity[dayStr] = (activity[dayStr] || 0) + 1;
            uniqueDatesSet.add(dayStr);
          });

          const sortedDates = Array.from(uniqueDatesSet)
              .map(str => new Date(str))
              .sort((a, b) => a - b);

          let hStreak = 0;
          let cStreak = 0;

          if (sortedDates.length > 0) {
              hStreak = 1;
              let tempStreak = 1;
              for (let i = 1; i < sortedDates.length; i++) {
                  const expectedNext = new Date(sortedDates[i - 1]);
                  expectedNext.setDate(expectedNext.getDate() + 1);
                  
                  if (expectedNext.toDateString() === sortedDates[i].toDateString()) {
                      tempStreak++;
                  } else {
                      tempStreak = 1;
                  }
                  if (tempStreak > hStreak) hStreak = tempStreak;
              }
              
              const today = new Date();
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              const isTodayActive = uniqueDatesSet.has(today.toDateString());
              const isYesterdayActive = uniqueDatesSet.has(yesterday.toDateString());
              
              if (isTodayActive || isYesterdayActive) {
                  let testDate = isTodayActive ? new Date(today) : new Date(yesterday);
                  while (uniqueDatesSet.has(testDate.toDateString())) {
                      cStreak++;
                      testDate.setDate(testDate.getDate() - 1);
                  }
              }
          }

          setActivityMap(activity);
          setCurrentStreak(cStreak);
          setHighestStreak(hStreak);
        } else {
          setActivityMap({});
          setCurrentStreak(0);
          setHighestStreak(0);
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
      }

      setLoading(false);
    };

    fetchActivityMap();
  }, [user]);

  return { activityMap, currentStreak, highestStreak, loading };
}

