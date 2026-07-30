const MS_PER_DAY = 24 * 60 * 60 * 1000;

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function wholeDaysBetween(startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = endDate.getTime();

  if (!Number.isFinite(start) || end <= start) {
    return 0;
  }

  return Math.floor((end - start) / MS_PER_DAY);
}

function goalTarget(profile) {
  if (profile.quitGoal === "7_days") {
    return { type: "days", target: 7, label: "7 day goal" };
  }

  if (profile.quitGoal === "30_days") {
    return { type: "days", target: 30, label: "30 day goal" };
  }

  if (profile.quitGoal === "save_100") {
    return { type: "money", target: 100, label: "$100 saved" };
  }

  return { type: "days", target: 365, label: "long-term streak" };
}

function milestone(key, label, description, unlocked) {
  return { key, label, description, unlocked };
}

function achievementMilestones({ daysVapeFree, currentStreak, moneySaved, vapesAvoided }) {
  return [
    milestone("first_day", "First Day", "24 hours vape-free", daysVapeFree >= 1),
    milestone("one_week", "First Week", "7 days vape-free", daysVapeFree >= 7),
    milestone("two_weeks", "Two Weeks", "14 days vape-free", daysVapeFree >= 14),
    milestone("one_month", "30 Days", "30 days vape-free", daysVapeFree >= 30),
    milestone("hundred_days", "100 Days", "100 days vape-free", daysVapeFree >= 100),
    milestone("one_year", "One Year", "365 days vape-free", daysVapeFree >= 365),
    milestone("streak_7", "Consistency", "7 day streak", currentStreak >= 7),
    milestone("healthy_heart", "Healthy Heart", "Heart health milestone", daysVapeFree >= 1),
    milestone("better_lungs", "Better Lungs", "Breathing improvement milestone", daysVapeFree >= 14),
    milestone("saved_50", "Saved $50", "Saved your first $50", moneySaved >= 50),
    milestone("saved_100", "Saved $100", "Saved your first $100", moneySaved >= 100),
    milestone("avoided_100", "Clean Choices", "100 vapes avoided", vapesAvoided >= 100),
    milestone("vape_free_hero", "Vape-Free Hero", "Long-term quit goal", daysVapeFree >= 365),
  ];
}

function calculateProgress(profile, now = new Date()) {
  const daysVapeFree = wholeDaysBetween(profile.quitStartDate, now);
  const moneySaved = roundMoney(daysVapeFree * profile.estimatedDailySpend);
  const vapesAvoided = Math.floor(daysVapeFree * profile.estimatedDailyVapeUsage);
  const currentStreak = daysVapeFree;
  const target = goalTarget(profile);
  const targetProgressValue = target.type === "money" ? moneySaved : daysVapeFree;
  const goalProgressPercent = Math.min(100, Math.floor((targetProgressValue / target.target) * 100));

  return {
    serverTimestamp: now.toISOString(),
    quitStartDate: profile.quitStartDate,
    daysVapeFree,
    currentStreak,
    moneySaved,
    vapesAvoided,
    goal: {
      label: target.label,
      current: targetProgressValue,
      target: target.target,
      percent: goalProgressPercent,
    },
    milestones: achievementMilestones({ daysVapeFree, currentStreak, moneySaved, vapesAvoided }),
  };
}

module.exports = { calculateProgress };
