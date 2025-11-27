from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SimpleRetrievalBot:
    def __init__(self, qa_pairs):
        """
        qa_pairs: liste av (spørsmål, svar)
        """
        self.questions = [q for q, _ in qa_pairs]
        self.answers = [a for _, a in qa_pairs]

        self.vectorizer = TfidfVectorizer(ngram_range=(1,2))
        self.question_matrix = self.vectorizer.fit_transform(self.questions)

    def get_response(self, text, min_sim=0.2):
        """
        Returner svaret til den mest like trenings-setningen.
        Hvis likheten er for lav, gi noe generisk.
        """
        if not text.strip():
            return "Si gjerne noe mer, så skal jeg prøve å hjelpe 😊"

        x = self.vectorizer.transform([text])
        sims = cosine_similarity(x, self.question_matrix)[0]
        best_idx = sims.argmax()
        best_score = sims[best_idx]

        if best_score < min_sim:
            return "Jeg er ikke helt sikker – kan du forklare det på en annen måte?"

        return self.answers[best_idx]

if __name__ == "__main__":
    data = [
        ("Hei", "Hei! Hva kan jeg hjelpe deg med?"),
        ("Hva er VOTE?", "VOTE er et historiedrevet action/strategispill der valgene dine betyr noe."),
        ("Hva er Vintra Studio?", "Vintra Studio er et lite indie-studio på tre utviklere."),
        ("Når kommer spillet?", "Vi sikter rundt 2026, men datoen kan endre seg."),
    ]

    bot = SimpleRetrievalBot(data)

    while True:
        user = input("Du: ")
        if user.lower() in ("quit", "exit"):
            break
        print("Bot:", bot.get_response(user))
