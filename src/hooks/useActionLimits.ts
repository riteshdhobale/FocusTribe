import { useState, useEffect } from 'react';
import { getTodaySwipeCounts, getMonthlyPromptCount } from '@/lib/profiles';

export const MAX_RIGHT_SWIPES = 5;
export const MAX_LEFT_SWIPES = 20;
export const MAX_MONTHLY_PROMPTS = 4;

export function useActionLimits() {
  const [rightSwipes, setRightSwipes] = useState(0);
  const [leftSwipes, setLeftSwipes] = useState(0);
  const [monthlyPrompts, setMonthlyPrompts] = useState(0);

  const refreshLimits = () => {
    const { right, left } = getTodaySwipeCounts();
    setRightSwipes(right);
    setLeftSwipes(left);
    setMonthlyPrompts(getMonthlyPromptCount());
  };

  useEffect(() => {
    refreshLimits();
  }, []);

  return {
    rightSwipes,
    leftSwipes,
    monthlyPrompts,
    canRightSwipe: rightSwipes < MAX_RIGHT_SWIPES,
    canLeftSwipe: leftSwipes < MAX_LEFT_SWIPES,
    canSendPrompt: monthlyPrompts < MAX_MONTHLY_PROMPTS,
    refreshLimits,
  };
}
