from orchestrator import orchestrate_analysis

if __name__ == "__main__":
    sample_speech = """
    Good morning everyone. Today I want to talk about the importance of daily exercise.
    Just 20 minutes of walking can improve both physical and mental health.
    I encourage you to make exercise a part of your daily routine.
    """
    
    feedback = orchestrate_analysis(sample_speech)
    print("===== Orchestrator Feedback =====")
    print(feedback)
