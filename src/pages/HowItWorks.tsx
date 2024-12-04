import React from 'react';
import { Dumbbell, Users, Target, Calendar, Star, Trophy, TrendingUp } from 'lucide-react';

export function HowItWorks() {
  const features = [
    {
      icon: <Dumbbell className="w-8 h-8 text-blue-500" />,
      title: "Workout Generation",
      description: "Create personalized workouts based on your goals, preferred body parts, and available equipment. Choose between strength training and weight loss programs.",
      tips: [
        "Use the 'Generate Workout' button to create new workouts",
        "Select multiple body parts for a comprehensive workout",
        "Choose equipment you have access to for relevant exercises",
        "Workouts are automatically scheduled for the current week"
      ]
    },
    {
      icon: <Users className="w-8 h-8 text-green-400" />,
      title: "FitFam System",
      description: "Connect with workout partners to share progress, compare stats, and stay motivated together.",
      tips: [
        "Send partner invites to other users",
        "View your partners' workout progress",
        "Compare weekly stats and achievements",
        "Favorite partners to keep them at the top of your list"
      ]
    },
    {
      icon: <Target className="w-8 h-8 text-orange-400" />,
      title: "Progress Tracking",
      description: "Track your exercises, sets, and weight progression over time. Monitor your completion rates and streaks.",
      tips: [
        "Log weights and reps for each exercise set",
        "Sets are marked complete when both weight and reps are entered",
        "View your personal records in the dashboard",
        "Track weekly completion rates and streaks"
      ]
    }
  ];

  const sections = [
    {
      icon: <Calendar className="w-6 h-6 text-blue-400" />,
      title: "Weekly Planning",
      content: "Workouts are organized by week, making it easy to plan and track your progress. Generate new workouts anytime and they'll be added to your current week's schedule."
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      title: "Favorites",
      content: "Mark workouts and FitFam partners as favorites for quick access. Favorite workouts appear in a special section for easy reuse."
    },
    {
      icon: <Trophy className="w-6 h-6 text-purple-400" />,
      title: "Difficulty Levels",
      content: "Workouts are automatically assigned difficulty levels (Easy, Medium, Hard) based on the number of exercises, sets, and muscle groups involved."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-400" />,
      title: "Statistics",
      content: "View comprehensive stats including total weight lifted, completion rates, and workout streaks. Compare your progress with your FitFam partners."
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">How Yujin Fit Works</h1>
          <p className="text-xl text-gray-400 mb-12">
            Your personal workout companion for tracking progress and staying motivated with friends
          </p>

          <div className="space-y-16">
            {/* Key Features */}
            <div className="space-y-12">
              <h2 className="text-2xl font-semibold text-white">Key Features</h2>
              <div className="grid gap-8 md:grid-cols-3">
                {features.map((feature, index) => (
                  <div key={index} className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-blue-500/10">
                    <div className="flex items-center space-x-3 mb-4">
                      {feature.icon}
                      <h3 className="text-xl font-medium text-white">{feature.title}</h3>
                    </div>
                    <p className="text-gray-400 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-2 text-sm">
                          <span className="text-blue-400 mt-1">•</span>
                          <span className="text-gray-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-white">Additional Features</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {sections.map((section, index) => (
                  <div key={index} className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-blue-500/10">
                    <div className="flex items-center space-x-3 mb-3">
                      {section.icon}
                      <h3 className="text-lg font-medium text-white">{section.title}</h3>
                    </div>
                    <p className="text-gray-400">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Getting Started */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">Getting Started</h2>
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-blue-500/10">
                <ol className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-400 font-bold">1.</span>
                    <p className="text-gray-300">Create an account with your basic information including height and weight</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-400 font-bold">2.</span>
                    <p className="text-gray-300">Generate your first workout by selecting your goals and preferences</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-400 font-bold">3.</span>
                    <p className="text-gray-300">Start tracking your sets and reps for each exercise</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-400 font-bold">4.</span>
                    <p className="text-gray-300">Connect with friends by sending FitFam invites</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-400 font-bold">5.</span>
                    <p className="text-gray-300">Monitor your progress and compare stats with your FitFam</p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}