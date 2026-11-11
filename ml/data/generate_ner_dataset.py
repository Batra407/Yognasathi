import json

ner_examples = [
    # English examples
    {
        "tokens": ["I", "am", "a", "45", "years", "old", "farmer", "from", "Punjab", "with", "3", "acres", "of", "land"],
        "tags": ["O", "O", "O", "B-AGE", "I-AGE", "I-AGE", "B-OCCUPATION", "O", "B-STATE", "O", "B-LAND", "I-LAND", "O", "O"]
    },
    {
        "tokens": ["A", "22", "year", "old", "female", "student", "living", "in", "Haryana", "from", "SC", "category"],
        "tags": ["O", "B-AGE", "I-AGE", "I-AGE", "B-GENDER", "B-OCCUPATION", "O", "O", "B-STATE", "O", "B-CATEGORY", "O"]
    },
    {
        "tokens": ["65", "years", "old", "retired", "senior", "citizen", "in", "Punjab", "income", "under", "1.5", "lakh"],
        "tags": ["B-AGE", "I-AGE", "I-AGE", "O", "B-OCCUPATION", "I-OCCUPATION", "O", "B-STATE", "O", "O", "B-INCOME", "I-INCOME"]
    },
    {
        "tokens": ["Unemployed", "male", "youth", "aged", "28", "in", "Delhi", "seeking", "skill", "training"],
        "tags": ["B-OCCUPATION", "B-GENDER", "O", "O", "B-AGE", "O", "B-STATE", "O", "O", "O"]
    },
    {
        "tokens": ["Small", "farmer", "having", "2.5", "acres", "land", "in", "Rajasthan", "with", "OBC", "status"],
        "tags": ["O", "B-OCCUPATION", "O", "B-LAND", "I-LAND", "O", "O", "B-STATE", "O", "B-CATEGORY", "O"]
    },
    {
        "tokens": ["Single", "mother", "female", "in", "Maharashtra", "annual", "income", "80000", "rupees"],
        "tags": ["O", "O", "B-GENDER", "O", "B-STATE", "O", "O", "B-INCOME", "I-INCOME"]
    },
    {
        "tokens": ["Handloom", "weaver", "in", "Tamil", "Nadu", "aged", "38", "earning", "2", "lakhs", "yearly"],
        "tags": ["B-OCCUPATION", "I-OCCUPATION", "O", "B-STATE", "I-STATE", "O", "B-AGE", "O", "B-INCOME", "I-INCOME", "O"]
    },
    {
        "tokens": ["College", "student", "age", "19", "in", "Punjab", "annual", "income", "below", "1", "lakh"],
        "tags": ["O", "B-OCCUPATION", "O", "B-AGE", "O", "B-STATE", "O", "O", "O", "B-INCOME", "I-INCOME"]
    },

    # Hindi examples
    {
        "tokens": ["मैं", "पंजाब", "का", "45", "वर्षीय", "किसान", "हूँ", "और", "3", "एकड़", "जमीन", "है"],
        "tags": ["O", "B-STATE", "O", "B-AGE", "I-AGE", "B-OCCUPATION", "O", "O", "B-LAND", "I-LAND", "O", "O"]
    },
    {
        "tokens": ["मेरी", "उम्र", "21", "साल", "है", "मैं", "हरियाणा", "की", "छात्रा", "हूँ"],
        "tags": ["O", "O", "B-AGE", "I-AGE", "O", "O", "B-STATE", "O", "B-OCCUPATION", "O"]
    },
    {
        "tokens": ["मेरी", "सालाना", "आय", "2", "लाख", "रुपये", "है", "और", "जाति", "ओबीसी", "है"],
        "tags": ["O", "O", "O", "B-INCOME", "I-INCOME", "O", "O", "O", "O", "B-CATEGORY", "O"]
    },
    {
        "tokens": ["मैं", "62", "वर्ष", "का", "वृद्ध", "नागरिक", "पंजाब", "में", "रहता", "हूँ"],
        "tags": ["O", "B-AGE", "I-AGE", "O", "B-OCCUPATION", "I-OCCUPATION", "B-STATE", "O", "O", "O"]
    },
    {
        "tokens": ["मैं", "एक", "बेरोजगार", "युवक", "हूँ", "उम्र", "26", "साल", "राजस्थान"],
        "tags": ["O", "O", "B-OCCUPATION", "O", "O", "O", "B-AGE", "I-AGE", "B-STATE"]
    },
    {
        "tokens": ["महिला", "उद्यमी", "उम्र", "34", "वर्ष", "उत्तर", "प्रदेश", "सालाना", "आय", "1.2", "लाख"],
        "tags": ["B-GENDER", "B-OCCUPATION", "O", "B-AGE", "I-AGE", "B-STATE", "I-STATE", "O", "O", "B-INCOME", "I-INCOME"]
    },

    # Punjabi examples
    {
        "tokens": ["ਮੈਂ", "ਪੰਜਾਬ", "ਦਾ", "45", "ਸਾਲਾ", "ਕਿਸਾਨ", "ਹਾਂ", "ਮੇਰੇ", "ਕੋਲ", "2", "ਏਕੜ", "ਜ਼ਮੀਨ", "ਹੈ"],
        "tags": ["O", "B-STATE", "O", "B-AGE", "I-AGE", "B-OCCUPATION", "O", "O", "O", "B-LAND", "I-LAND", "O", "O"]
    },
    {
        "tokens": ["ਮੇਰੀ", "ਉਮਰ", "68", "ਸਾਲ", "ਹੈ", "ਅਤੇ", "ਮੈਂ", "ਪੰਜਾਬ", "ਵਿੱਚ", "ਰਹਿੰਦਾ", "ਹਾਂ"],
        "tags": ["O", "O", "B-AGE", "I-AGE", "O", "O", "O", "B-STATE", "O", "O", "O"]
    },
    {
        "tokens": ["ਮੈਂ", "20", "ਸਾਲ", "ਦੀ", "ਵਿਦਿਆਰਥਣ", "ਹਾਂ", "ਐਸਸੀ", "ਸ਼੍ਰੇਣੀ", "ਨਾਲ", "ਸਬੰਧਤ"],
        "tags": ["O", "B-AGE", "I-AGE", "O", "B-OCCUPATION", "O", "B-CATEGORY", "O", "O", "O"]
    },
    {
        "tokens": ["ਮੇਰੀ", "ਸਾਲਾਨਾ", "ਆਮਦਨ", "1.5", "ਲੱਖ", "ਹੈ", "ਮੈਂ", "ਬੇਰੁਜ਼ਗਾਰ", "ਹਾਂ"],
        "tags": ["O", "O", "O", "B-INCOME", "I-INCOME", "O", "O", "B-OCCUPATION", "O"]
    },

    # Hinglish examples
    {
        "tokens": ["Main", "Punjab", "ka", "farmer", "hu", "age", "42", "zameen", "4", "acre"],
        "tags": ["O", "B-STATE", "O", "B-OCCUPATION", "O", "O", "B-AGE", "O", "B-LAND", "I-LAND"]
    },
    {
        "tokens": ["Meri", "age", "25", "hai", "Haryana", "se", "hu", "unemployed", "male"],
        "tags": ["O", "O", "B-AGE", "O", "B-STATE", "O", "O", "B-OCCUPATION", "B-GENDER"]
    },
    {
        "tokens": ["Annual", "income", "2", "lakh", "hai", "caste", "General", "student", "hu"],
        "tags": ["O", "O", "B-INCOME", "I-INCOME", "O", "O", "B-CATEGORY", "B-OCCUPATION", "O"]
    }
]

with open("ml/data/ner_dataset.json", "w", encoding="utf-8") as f:
    json.dump(ner_examples, f, ensure_ascii=False, indent=2)

print(f"Generated {len(ner_examples)} NER sequence tagging examples.")

