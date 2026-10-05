const API_BASE = "";
const TOKEN_KEY = "sra_jwt_token";
const ANALYSIS_KEY = "sra_latest_analysis";
const INTERVIEW_STATE_KEY = "sra_interview_state";
const ANALYSIS_READY_KEY = "sra_analysis_ready";

const $ = (id) => document.getElementById(id);
const page = document.body.dataset.page;

const state = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  currentUser: null,
  roles: {},
  lastAnalysis: readStoredAnalysis(),
  analysisVisible: false,
  voices: [],
  interviewIndex: 0,
  interviewAnswers: readInterviewState(),
  interviewFeedback: {},
  selectedCareerRole: "",
  gd: {
    topics: [],
    session: null,
    timerId: null,
    recognition: null,
  },
  softSkills: {
    modules: [],
    progress: { completedModules: [], attempts: [] },
    activeModuleId: "",
    timerId: null,
    timerRemaining: 60,
  },
};

const languageLabels = {
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "hi-IN": "Hindi",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
};

const interviewAnswerBank = {
  "Explain OOP principles.": {
    answer: "OOP is based on encapsulation, inheritance, polymorphism, and abstraction.",
    keywords: ["encapsulation", "inheritance", "polymorphism", "abstraction"],
  },
  "How does REST differ from RPC?": {
    answer: "REST is resource-oriented and uses standard HTTP methods, while RPC is action-oriented and calls remote procedures or functions directly.",
    keywords: ["resource", "http", "methods", "action", "procedure", "function"],
  },
  "What is the difference between an array and a linked list?": {
    answer: "An array stores elements in contiguous memory for fast indexed access, while a linked list stores nodes connected by pointers and is better for frequent insertions or deletions.",
    keywords: ["contiguous", "index", "access", "nodes", "pointers", "insertions"],
  },
  "Explain stack and queue with examples.": {
    answer: "A stack follows LIFO, such as browser back history, while a queue follows FIFO, such as print jobs waiting to be processed.",
    keywords: ["lifo", "fifo", "history", "print", "stack", "queue"],
  },
  "What is time complexity and why is it important?": {
    answer: "Time complexity describes how runtime grows with input size, and it helps compare algorithms and predict performance at scale.",
    keywords: ["runtime", "input size", "algorithms", "performance", "scale"],
  },
  "How does hashing work?": {
    answer: "Hashing converts input data into a fixed-size value using a hash function, which is useful for fast lookup, indexing, and integrity checks.",
    keywords: ["hash function", "fixed-size", "lookup", "indexing", "integrity"],
  },
  "What is the difference between process and thread?": {
    answer: "A process has its own memory space and resources, while threads run within a process and share memory, making communication faster but synchronization harder.",
    keywords: ["memory space", "resources", "share memory", "communication", "synchronization"],
  },
  "How does garbage collection work?": {
    answer: "Garbage collection automatically frees memory occupied by objects that are no longer reachable by the program.",
    keywords: ["frees memory", "objects", "reachable", "automatic"],
  },
  "What are design patterns? Name a few you have used.": {
    answer: "Design patterns are reusable solutions to common software design problems. Examples include Singleton, Factory, Observer, and Strategy.",
    keywords: ["reusable", "common", "singleton", "factory", "observer", "strategy"],
  },
  "Explain dependency injection.": {
    answer: "Dependency injection supplies required dependencies from outside a class or function instead of creating them internally, which improves modularity and testing.",
    keywords: ["dependencies", "outside", "modularity", "testing", "injection"],
  },
  "What is the difference between synchronous and asynchronous programming?": {
    answer: "Synchronous code runs step by step and blocks until completion, while asynchronous code allows other work to continue while waiting for operations like I/O.",
    keywords: ["blocks", "step by step", "waiting", "i/o", "asynchronous"],
  },
  "How do promises work in JavaScript?": {
    answer: "A Promise represents an async result that can be pending, fulfilled, or rejected, and it is handled with then, catch, or async/await.",
    keywords: ["pending", "fulfilled", "rejected", "then", "catch", "await"],
  },
  "What is a race condition?": {
    answer: "A race condition happens when multiple operations access shared state at the same time and the result depends on execution order.",
    keywords: ["shared state", "same time", "execution order", "concurrent"],
  },
  "How would you design a URL shortener?": {
    answer: "A URL shortener stores long URLs against unique short codes, redirects requests, handles collisions, and often tracks analytics with a scalable database and cache.",
    keywords: ["short codes", "redirects", "collisions", "database", "cache", "analytics"],
  },
  "What is the difference between SQL and NoSQL?": {
    answer: "SQL databases are relational and use structured schemas and joins, while NoSQL databases are often schema-flexible and are designed for scale or specific data models.",
    keywords: ["relational", "schemas", "joins", "flexible", "scale", "data models"],
  },
  "Explain normalization in databases.": {
    answer: "Normalization organizes data into related tables to reduce redundancy and improve consistency.",
    keywords: ["related tables", "reduce redundancy", "consistency", "normalization"],
  },
  "What are indexes in a database?": {
    answer: "Indexes are data structures that speed up query lookups on columns, though they increase storage use and can slow writes.",
    keywords: ["speed", "query", "columns", "storage", "writes"],
  },
  "How would you optimize a slow API?": {
    answer: "You would profile the API, optimize database queries, add caching, reduce payload size, improve concurrency, and monitor bottlenecks.",
    keywords: ["profile", "database queries", "caching", "payload", "concurrency", "bottlenecks"],
  },
  "What is authentication vs authorization?": {
    answer: "Authentication verifies who a user is, while authorization decides what that user is allowed to access.",
    keywords: ["verifies", "user", "allowed", "access", "authorization"],
  },
  "How do JWT tokens work?": {
    answer: "JWTs are signed tokens containing claims that the server can verify, allowing stateless authentication until the token expires.",
    keywords: ["signed", "claims", "verify", "stateless", "expires"],
  },
  "What is data visualization?": {
    answer: "Data visualization is the graphical representation of data using charts, graphs, dashboards, or plots to communicate patterns and insights.",
    keywords: ["graphical", "charts", "graphs", "dashboard", "insights", "patterns"],
  },
  "Explain SQL joins.": {
    answer: "SQL joins combine rows from two or more tables using a related column. Common joins are INNER, LEFT, RIGHT, and FULL joins.",
    keywords: ["combine", "tables", "related", "inner", "left", "right", "full"],
  },
  "What is the difference between INNER JOIN and LEFT JOIN?": {
    answer: "INNER JOIN returns only matching rows from both tables, while LEFT JOIN returns all rows from the left table and matching rows from the right table.",
    keywords: ["matching", "both tables", "left table", "right table", "inner join", "left join"],
  },
  "How do you handle missing values in a dataset?": {
    answer: "You handle missing values by analyzing why they are missing and then removing rows, imputing values, or using model-based techniques depending on the context.",
    keywords: ["missing", "removing", "imputing", "model-based", "context"],
  },
  "What is outlier detection?": {
    answer: "Outlier detection identifies unusually distant observations that may indicate errors, rare events, or meaningful anomalies.",
    keywords: ["unusually", "distant", "errors", "rare events", "anomalies"],
  },
  "Explain mean, median, and mode.": {
    answer: "Mean is the average, median is the middle value in sorted data, and mode is the most frequent value.",
    keywords: ["average", "middle", "sorted", "frequent"],
  },
  "What is standard deviation?": {
    answer: "Standard deviation measures how spread out data values are from the mean.",
    keywords: ["spread", "values", "mean", "deviation"],
  },
  "When would you use correlation analysis?": {
    answer: "Correlation analysis is used to measure the strength and direction of a relationship between two variables.",
    keywords: ["relationship", "strength", "direction", "two variables"],
  },
  "What is hypothesis testing?": {
    answer: "Hypothesis testing is a statistical method used to evaluate whether evidence from sample data supports rejecting a null hypothesis.",
    keywords: ["statistical", "sample data", "rejecting", "null hypothesis", "evidence"],
  },
  "Explain p-value in simple terms.": {
    answer: "A p-value estimates how likely the observed result would be if the null hypothesis were true.",
    keywords: ["likely", "observed result", "null hypothesis", "true"],
  },
  "What is the difference between descriptive and inferential statistics?": {
    answer: "Descriptive statistics summarize data you already have, while inferential statistics use sample data to make conclusions about a larger population.",
    keywords: ["summarize", "sample data", "conclusions", "population"],
  },
  "How do pivot tables help in analysis?": {
    answer: "Pivot tables quickly group, summarize, and compare data across dimensions such as category, region, or time.",
    keywords: ["group", "summarize", "compare", "dimensions"],
  },
  "What are KPIs and how do you define them?": {
    answer: "KPIs are measurable indicators of performance, and they should be defined to align with business goals, targets, and time frames.",
    keywords: ["measurable", "performance", "business goals", "targets", "time frames"],
  },
  "How would you present insights to a non-technical stakeholder?": {
    answer: "Use simple language, focus on business impact, highlight key trends, and support conclusions with clear visuals and recommendations.",
    keywords: ["simple language", "business impact", "trends", "visuals", "recommendations"],
  },
  "What is the difference between Power BI and Excel for analysis?": {
    answer: "Excel is useful for flexible spreadsheet analysis and smaller models, while Power BI is stronger for interactive dashboards, data modeling, and sharing at scale.",
    keywords: ["spreadsheet", "dashboards", "data modeling", "sharing", "scale"],
  },
  "Explain data cleaning steps for a messy dataset.": {
    answer: "Data cleaning includes removing duplicates, handling missing values, fixing formats, correcting inconsistencies, validating ranges, and checking outliers.",
    keywords: ["duplicates", "missing values", "formats", "inconsistencies", "ranges", "outliers"],
  },
  "What is a dashboard and what makes it effective?": {
    answer: "A dashboard is a visual summary of key metrics, and it is effective when it is clear, relevant, easy to scan, and focused on decision-making.",
    keywords: ["visual summary", "metrics", "clear", "relevant", "decision-making"],
  },
  "How do you validate data quality?": {
    answer: "Validate data quality by checking completeness, accuracy, consistency, uniqueness, timeliness, and acceptable value ranges.",
    keywords: ["completeness", "accuracy", "consistency", "uniqueness", "timeliness", "ranges"],
  },
  "What is cohort analysis?": {
    answer: "Cohort analysis groups users or records by a shared characteristic over time to compare behavior or outcomes.",
    keywords: ["groups", "shared characteristic", "over time", "behavior", "outcomes"],
  },
  "How would you analyze sales decline in one region?": {
    answer: "Compare the region with past periods and other regions, segment by product and customer, inspect pricing and marketing changes, and identify root causes with data.",
    keywords: ["compare", "past periods", "other regions", "segment", "pricing", "root causes"],
  },
  "Difference between CSR and SSR?": {
    answer: "CSR renders pages in the browser using JavaScript, while SSR renders HTML on the server before sending it to the client.",
    keywords: ["browser", "javascript", "server", "html", "render"],
  },
  "How does the browser render HTML/CSS?": {
    answer: "The browser parses HTML into the DOM, CSS into the CSSOM, combines them into a render tree, performs layout, and then paints pixels to the screen.",
    keywords: ["dom", "cssom", "render tree", "layout", "paint"],
  },
  "What is semantic HTML?": {
    answer: "Semantic HTML uses meaningful elements like header, nav, main, article, and button to describe content structure and improve accessibility and SEO.",
    keywords: ["meaningful", "structure", "accessibility", "seo", "semantic"],
  },
  "What is the DOM?": {
    answer: "The DOM is the browser's object model of an HTML document that scripts can read and modify dynamically.",
    keywords: ["object model", "document", "scripts", "modify", "browser"],
  },
  "Explain event bubbling and event capturing.": {
    answer: "Event capturing travels from the root down to the target, while bubbling travels from the target back up through ancestor elements.",
    keywords: ["capturing", "root", "target", "bubbling", "ancestor"],
  },
  "What is the box model in CSS?": {
    answer: "The CSS box model consists of content, padding, border, and margin, which together determine an element's size and spacing.",
    keywords: ["content", "padding", "border", "margin", "spacing"],
  },
  "What is responsive design?": {
    answer: "Responsive design creates layouts that adapt well to different screen sizes and devices.",
    keywords: ["adapt", "screen sizes", "devices", "layouts"],
  },
  "How do media queries work?": {
    answer: "Media queries apply CSS rules conditionally based on viewport characteristics such as width, height, orientation, or resolution.",
    keywords: ["css rules", "viewport", "width", "orientation", "resolution"],
  },
  "What is flexbox and when would you use it?": {
    answer: "Flexbox is a one-dimensional layout system used to align and distribute items in a row or column.",
    keywords: ["one-dimensional", "align", "distribute", "row", "column"],
  },
  "What is CSS Grid?": {
    answer: "CSS Grid is a two-dimensional layout system that arranges content into rows and columns.",
    keywords: ["two-dimensional", "rows", "columns", "layout"],
  },
  "What is the difference between localStorage and sessionStorage?": {
    answer: "localStorage persists until cleared, while sessionStorage lasts only for the current browser tab session.",
    keywords: ["persists", "cleared", "browser tab", "session"],
  },
  "How do cookies work?": {
    answer: "Cookies are small key-value data stored by the browser and sent with HTTP requests so servers can maintain state such as sessions or preferences.",
    keywords: ["key-value", "browser", "http requests", "state", "sessions", "preferences"],
  },
  "What is CORS?": {
    answer: "CORS is a browser security mechanism that controls whether a web page can request resources from a different origin.",
    keywords: ["browser security", "different origin", "request resources", "cors"],
  },
  "How do you improve website performance?": {
    answer: "Improve performance by minimizing assets, compressing files, caching, lazy loading, optimizing images, reducing render-blocking work, and using CDNs.",
    keywords: ["minimizing", "compressing", "caching", "lazy loading", "images", "cdn"],
  },
  "What is lazy loading?": {
    answer: "Lazy loading delays loading non-critical resources until they are needed, which reduces initial page load time.",
    keywords: ["delays", "non-critical", "needed", "initial page load"],
  },
  "What is accessibility in web development?": {
    answer: "Accessibility means building websites that people with disabilities can perceive, understand, navigate, and use effectively.",
    keywords: ["disabilities", "perceive", "understand", "navigate", "use"],
  },
  "What are ARIA attributes?": {
    answer: "ARIA attributes provide additional semantic information to assistive technologies when native HTML semantics are not enough.",
    keywords: ["semantic information", "assistive technologies", "native html", "aria"],
  },
  "How do you secure frontend forms?": {
    answer: "Secure frontend forms with client and server validation, input sanitization, CSRF protection, HTTPS, and by avoiding trust in client-side checks alone.",
    keywords: ["validation", "sanitization", "csrf", "https", "server"],
  },
  "What is the role of bundlers like Vite or Webpack?": {
    answer: "Bundlers process modules and assets, optimize code, support development tooling, and produce efficient files for deployment.",
    keywords: ["modules", "assets", "optimize", "tooling", "deployment"],
  },
  "How do SPAs differ from MPAs?": {
    answer: "SPAs update content dynamically in one loaded page, while MPAs load a new HTML page for each route or major view.",
    keywords: ["dynamically", "one page", "new html page", "route"],
  },
  "Bias vs variance tradeoff?": {
    answer: "Bias is error from overly simple assumptions, variance is error from sensitivity to training data, and the tradeoff is balancing underfitting and overfitting.",
    keywords: ["bias", "variance", "underfitting", "overfitting", "training data"],
  },
  "How do you evaluate a classification model?": {
    answer: "You evaluate a classification model with metrics such as accuracy, precision, recall, F1-score, ROC-AUC, and a confusion matrix.",
    keywords: ["accuracy", "precision", "recall", "f1-score", "roc-auc", "confusion matrix"],
  },
  "What is overfitting?": {
    answer: "Overfitting happens when a model learns training data too closely, including noise, and performs poorly on new data.",
    keywords: ["training data", "noise", "poorly", "new data"],
  },
  "What is underfitting?": {
    answer: "Underfitting happens when a model is too simple to capture important patterns in the data.",
    keywords: ["too simple", "patterns", "data", "model"],
  },
  "How does train-test split work?": {
    answer: "Train-test split separates data into a training set for learning and a test set for evaluating generalization on unseen data.",
    keywords: ["training set", "test set", "generalization", "unseen data"],
  },
  "What is cross-validation?": {
    answer: "Cross-validation repeatedly splits data into training and validation folds to estimate model performance more reliably.",
    keywords: ["splits", "training", "validation folds", "performance"],
  },
  "Explain precision and recall.": {
    answer: "Precision is the proportion of predicted positives that are correct, while recall is the proportion of actual positives that were found.",
    keywords: ["predicted positives", "correct", "actual positives", "found"],
  },
  "What is an ROC curve?": {
    answer: "An ROC curve plots true positive rate against false positive rate across classification thresholds.",
    keywords: ["true positive rate", "false positive rate", "classification thresholds"],
  },
  "What is feature engineering?": {
    answer: "Feature engineering creates, transforms, or selects input variables to improve model performance.",
    keywords: ["creates", "transforms", "selects", "input variables", "performance"],
  },
  "How do you handle imbalanced data?": {
    answer: "You can handle imbalanced data with resampling, class weights, appropriate metrics, anomaly approaches, or collecting more minority samples.",
    keywords: ["resampling", "class weights", "metrics", "minority samples"],
  },
  "What is regularization?": {
    answer: "Regularization adds a penalty to the model to reduce complexity and prevent overfitting.",
    keywords: ["penalty", "reduce complexity", "prevent overfitting"],
  },
  "Explain gradient descent.": {
    answer: "Gradient descent iteratively updates model parameters in the direction that reduces the loss function.",
    keywords: ["iteratively", "parameters", "reduces", "loss function"],
  },
  "What is the difference between supervised and unsupervised learning?": {
    answer: "Supervised learning uses labeled data to predict outputs, while unsupervised learning finds structure or patterns in unlabeled data.",
    keywords: ["labeled data", "predict outputs", "patterns", "unlabeled data"],
  },
  "What is the difference between bagging and boosting?": {
    answer: "Bagging trains models in parallel to reduce variance, while boosting trains sequentially to correct previous errors and reduce bias.",
    keywords: ["parallel", "reduce variance", "sequentially", "correct previous errors", "reduce bias"],
  },
  "What is a confusion matrix?": {
    answer: "A confusion matrix is a table showing true positives, true negatives, false positives, and false negatives for a classifier.",
    keywords: ["true positives", "true negatives", "false positives", "false negatives"],
  },
  "How do you deploy a machine learning model?": {
    answer: "You package the model, expose it through an API or batch pipeline, manage dependencies, monitor performance, and support updates or rollback.",
    keywords: ["package", "api", "batch pipeline", "dependencies", "monitor", "rollback"],
  },
  "What is MLOps?": {
    answer: "MLOps is the practice of managing machine learning lifecycle operations such as training, deployment, monitoring, versioning, and collaboration.",
    keywords: ["lifecycle", "deployment", "monitoring", "versioning", "collaboration"],
  },
  "How would you monitor model drift?": {
    answer: "Monitor model drift by tracking changes in input data, prediction distributions, and real-world performance over time.",
    keywords: ["input data", "prediction distributions", "performance", "over time"],
  },
  "What is hyperparameter tuning?": {
    answer: "Hyperparameter tuning is the process of searching for the best configuration values, such as learning rate or tree depth, to improve model performance.",
    keywords: ["searching", "configuration values", "learning rate", "tree depth", "performance"],
  },
  "Explain the difference between classification and regression.": {
    answer: "Classification predicts discrete categories, while regression predicts continuous numeric values.",
    keywords: ["discrete categories", "continuous", "numeric values"],
  },
  "What is the difference between AI, ML, and deep learning?": {
    answer: "AI is the broad field of making machines perform intelligent tasks, ML is a subset where models learn patterns from data, and deep learning is a subset of ML that uses multi-layer neural networks.",
    keywords: ["broad field", "subset", "learn patterns", "data", "neural networks"],
  },
  "How do you choose between a classical ML model and a neural network?": {
    answer: "Choose based on data size, feature complexity, interpretability needs, training cost, and expected performance. Classical ML often works well on structured data, while neural networks are stronger for complex unstructured data.",
    keywords: ["data size", "interpretability", "structured data", "unstructured data", "performance"],
  },
  "What is feature engineering and why is it important?": {
    answer: "Feature engineering is the process of creating, transforming, or selecting input features so the model can learn better patterns and achieve stronger performance.",
    keywords: ["creating", "transforming", "selecting", "input features", "performance"],
  },
  "How do you evaluate an NLP model?": {
    answer: "You evaluate an NLP model using task-specific metrics such as accuracy, precision, recall, F1-score, BLEU, or ROUGE, along with error analysis on real examples.",
    keywords: ["task-specific", "accuracy", "precision", "recall", "f1", "error analysis"],
  },
  "What is transfer learning?": {
    answer: "Transfer learning reuses a model pre-trained on a large dataset and fine-tunes it for a new but related task.",
    keywords: ["pre-trained", "large dataset", "fine-tunes", "related task"],
  },
  "How do you prevent overfitting in deep learning?": {
    answer: "Common ways include dropout, regularization, early stopping, data augmentation, and using more training data or simpler models.",
    keywords: ["dropout", "regularization", "early stopping", "data augmentation", "training data"],
  },
  "What is the role of embeddings in AI systems?": {
    answer: "Embeddings convert text, images, or other inputs into dense numeric vectors that capture semantic similarity and make search, recommendation, and model input more effective.",
    keywords: ["dense numeric vectors", "semantic similarity", "search", "recommendation", "model input"],
  },
  "How would you deploy an AI model to production?": {
    answer: "Package the model with its dependencies, expose it through an API or batch pipeline, version it, test it, and monitor latency, accuracy, and failures after release.",
    keywords: ["dependencies", "api", "batch pipeline", "version", "monitor"],
  },
  "How do you monitor an AI model after deployment?": {
    answer: "Monitor prediction quality, drift in input data, latency, error rates, resource usage, and business outcomes to detect issues early.",
    keywords: ["prediction quality", "drift", "latency", "error rates", "business outcomes"],
  },
  "What ethical issues should be considered in AI systems?": {
    answer: "Important issues include bias, fairness, privacy, explainability, security, misuse, and accountability for model decisions.",
    keywords: ["bias", "fairness", "privacy", "explainability", "security", "accountability"],
  },
  "What is the CIA triad in cybersecurity?": {
    answer: "The CIA triad stands for confidentiality, integrity, and availability, which are the core goals of information security.",
    keywords: ["confidentiality", "integrity", "availability", "information security"],
  },
  "What is the difference between vulnerability, threat, and risk?": {
    answer: "A vulnerability is a weakness, a threat is something that can exploit that weakness, and risk is the potential impact and likelihood of that threat succeeding.",
    keywords: ["weakness", "exploit", "impact", "likelihood", "threat"],
  },
  "How does multi-factor authentication improve security?": {
    answer: "Multi-factor authentication requires more than one proof of identity, making it much harder for attackers to gain access with only a stolen password.",
    keywords: ["more than one", "proof of identity", "stolen password", "access"],
  },
  "What is phishing and how can it be prevented?": {
    answer: "Phishing is a social engineering attack that tricks users into revealing sensitive information. It can be reduced with user awareness, email filtering, MFA, and verification practices.",
    keywords: ["social engineering", "sensitive information", "awareness", "email filtering", "mfa"],
  },
  "What is the purpose of a firewall?": {
    answer: "A firewall filters incoming and outgoing network traffic based on security rules to block unauthorized access while allowing legitimate communication.",
    keywords: ["filters", "network traffic", "security rules", "unauthorized access"],
  },
  "What is SIEM and how is it used?": {
    answer: "SIEM stands for Security Information and Event Management. It collects, correlates, and analyzes logs from many systems to detect threats and support incident response.",
    keywords: ["security information and event management", "collects", "correlates", "logs", "incident response"],
  },
  "How do you respond to a suspected security incident?": {
    answer: "Follow an incident response process: identify the issue, contain it, investigate the cause, eradicate the threat, recover systems, and document lessons learned.",
    keywords: ["identify", "contain", "investigate", "eradicate", "recover", "lessons learned"],
  },
  "What is the principle of least privilege?": {
    answer: "Least privilege means users and systems should receive only the minimum access needed to perform their tasks.",
    keywords: ["minimum access", "users", "systems", "tasks"],
  },
  "What is the difference between symmetric and asymmetric encryption?": {
    answer: "Symmetric encryption uses the same key for encryption and decryption, while asymmetric encryption uses a public-private key pair.",
    keywords: ["same key", "decryption", "public-private key pair", "encryption"],
  },
  "How do you secure endpoints in an organization?": {
    answer: "Secure endpoints with patching, antivirus or EDR, strong authentication, disk encryption, device policies, monitoring, and user awareness.",
    keywords: ["patching", "edr", "authentication", "disk encryption", "monitoring"],
  },
  "What is CI/CD?": {
    answer: "CI/CD stands for Continuous Integration and Continuous Delivery or Deployment. It automates building, testing, and releasing software so teams can ship changes reliably and quickly.",
    keywords: ["continuous integration", "continuous delivery", "deployment", "building", "testing", "releasing"],
  },
  "What is infrastructure as code?": {
    answer: "Infrastructure as code manages servers, networks, and cloud resources through version-controlled configuration files instead of manual setup.",
    keywords: ["version-controlled", "configuration files", "servers", "cloud resources", "manual setup"],
  },
  "How does Docker help in application deployment?": {
    answer: "Docker packages an application and its dependencies into containers, which makes environments more consistent and deployment more portable.",
    keywords: ["containers", "dependencies", "consistent", "portable", "deployment"],
  },
  "What is Kubernetes and why is it used?": {
    answer: "Kubernetes is a container orchestration platform used to automate deployment, scaling, service discovery, and recovery for containerized applications.",
    keywords: ["container orchestration", "deployment", "scaling", "service discovery", "recovery"],
  },
  "What is the difference between continuous delivery and continuous deployment?": {
    answer: "Continuous delivery prepares every change for release but may require manual approval, while continuous deployment automatically releases every validated change to production.",
    keywords: ["manual approval", "automatically releases", "validated change", "production"],
  },
  "How do you monitor production systems?": {
    answer: "Monitor production with metrics, logs, traces, dashboards, alerts, and SLOs so issues can be detected and resolved quickly.",
    keywords: ["metrics", "logs", "traces", "alerts", "slos"],
  },
  "What is configuration management?": {
    answer: "Configuration management keeps system settings consistent across environments using controlled, repeatable definitions and automation tools.",
    keywords: ["consistent", "environments", "repeatable", "automation tools", "settings"],
  },
  "How would you handle a failed deployment in production?": {
    answer: "First contain impact by rolling back or shifting traffic, then inspect logs and metrics, identify the root cause, fix it safely, and update the release process to prevent repeats.",
    keywords: ["rolling back", "traffic", "logs", "metrics", "root cause", "release process"],
  },
  "Why are load balancing and auto-scaling important?": {
    answer: "They improve availability, performance, and resilience by distributing traffic and adjusting capacity when demand changes.",
    keywords: ["availability", "performance", "resilience", "distributing traffic", "capacity"],
  },
  "How do you secure a CI/CD pipeline?": {
    answer: "Secure the pipeline with access control, secret management, artifact signing, dependency scanning, code review, and audit logging.",
    keywords: ["access control", "secret management", "artifact signing", "dependency scanning", "audit logging"],
  },
  "Explain your strongest project.": {
    answer: "Describe the project goal, your role, the technologies used, the challenges faced, and measurable outcomes.",
    keywords: ["goal", "role", "technologies", "challenges", "outcomes"],
  },
  "What are your career goals?": {
    answer: "A strong answer explains short-term growth goals, long-term direction, and how the target role supports that path.",
    keywords: ["short-term", "long-term", "growth", "role", "path"],
  },
};

const careerDescriptions = {
  "Software Developer": "Builds application features, APIs, and backend logic while collaborating on performance, code quality, and system reliability.",
  "Data Analyst": "Transforms raw data into reports, dashboards, and business insights using SQL, visualization tools, and statistical thinking.",
  "Web Developer": "Creates responsive user interfaces and web applications with strong focus on browser behavior, frontend frameworks, and APIs.",
  "Machine Learning Engineer": "Designs and deploys predictive models, production ML pipelines, and data-driven systems for intelligent applications.",
  "AIML Engineer": "Builds AI and machine learning solutions using data pipelines, model training, deep learning, NLP, and production deployment practices.",
  "Cyber Security Analyst": "Monitors threats, investigates incidents, strengthens security controls, and helps protect systems, networks, and data.",
  "DevOps Engineer": "Automates deployment, infrastructure, monitoring, and CI/CD pipelines to improve delivery speed and system stability.",
};

function readStoredAnalysis() {
  try {
    return JSON.parse(localStorage.getItem(ANALYSIS_KEY) || "null");
  } catch {
    return null;
  }
}

function storeAnalysis(data) {
  state.lastAnalysis = data;
  state.selectedCareerRole = data?.role || "";
  localStorage.setItem(ANALYSIS_KEY, JSON.stringify(data));
  sessionStorage.setItem(ANALYSIS_READY_KEY, "1");
  state.interviewIndex = 0;
  state.interviewAnswers = {};
  state.interviewFeedback = {};
  writeInterviewState();
}

function readInterviewState() {
  try {
    return JSON.parse(localStorage.getItem(INTERVIEW_STATE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeInterviewState() {
  localStorage.setItem(INTERVIEW_STATE_KEY, JSON.stringify(state.interviewAnswers));
}

function clearStoredAnalysis() {
  state.lastAnalysis = null;
  state.selectedCareerRole = "";
  state.interviewIndex = 0;
  state.interviewAnswers = {};
  state.interviewFeedback = {};
  localStorage.removeItem(ANALYSIS_KEY);
  localStorage.removeItem(INTERVIEW_STATE_KEY);
  sessionStorage.removeItem(ANALYSIS_READY_KEY);
}

function stopGdTimer() {
  if (state.gd.timerId) {
    clearInterval(state.gd.timerId);
    state.gd.timerId = null;
  }
}

function stopSoftSkillTimer() {
  if (state.softSkills.timerId) {
    clearInterval(state.softSkills.timerId);
    state.softSkills.timerId = null;
  }
}

function hasActiveAnalysis() {
  return sessionStorage.getItem(ANALYSIS_READY_KEY) === "1" && !!state.lastAnalysis;
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return {
      email: payload.email,
      id: payload.userId,
      isAdmin: !!payload.isAdmin,
    };
  } catch {
    return null;
  }
}

function isAdminManagementPage() {
  return ["admin", "gd-admin", "resume-admin", "softskills-admin"].includes(page);
}

function ensureAuthenticated() {
  if (!state.token) {
    window.location.href = "index.html";
    return false;
  }

  const user = decodeToken(state.token);
  if (!user) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "index.html";
    return false;
  }

  state.currentUser = user;
  return true;
}

function setMessage(id, message, isError = false) {
  const el = $(id);
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? "#fca5a5" : "#93c5fd";
}

function renderChips(containerId, items, cls = "") {
  const el = $(containerId);
  if (!el) return;
  el.innerHTML = "";

  items.forEach((item) => {
    const span = document.createElement("span");
    span.className = `chip ${cls}`.trim();
    span.textContent = item;
    el.appendChild(span);
  });
}

function updateAuthActions() {
  const actions = $("authActions");
  if (!actions) return;

  if (!state.currentUser) {
    actions.innerHTML = "";
    return;
  }

  actions.innerHTML = `
    <span>Signed in: ${state.currentUser.email}${state.currentUser.isAdmin ? " (Admin)" : ""}</span>
    ${state.currentUser.isAdmin ? '<button id="adminDashboardBtn" type="button">Admin Dashboard</button>' : ""}
    <button id="logoutBtn" type="button">Logout</button>
  `;

  $("adminDashboardBtn")?.addEventListener("click", () => {
    window.location.href = "admin.html";
  });

  $("logoutBtn").addEventListener("click", () => {
    state.token = "";
    state.currentUser = null;
    localStorage.removeItem(TOKEN_KEY);
    clearStoredAnalysis();
    stopGdTimer();
    stopSoftSkillTimer();
    if (getSpeechSupport()) window.speechSynthesis.cancel();
    window.location.href = "index.html";
  });
}

async function loadRoles() {
  const { roles } = await api("/api/roles");
  state.roles = roles || {};

  const roleSelect = $("roleSelect");
  if (!roleSelect) return;

  roleSelect.innerHTML = "";
  Object.keys(state.roles).forEach((role) => {
    const option = document.createElement("option");
    option.value = role;
    option.textContent = role;
    roleSelect.appendChild(option);
  });

  renderRoleSkills();
}

function renderRoleSkills() {
  const roleSelect = $("roleSelect");
  if (!roleSelect) return;
  renderChips("roleSkills", state.roles[roleSelect.value] || []);
}

function getCareerOptions() {
  if (!state.lastAnalysis?.extracted?.skills || !state.roles) return [];
  const userSkills = (state.lastAnalysis.extracted.skills || []).map((skill) => String(skill).trim().toLowerCase());

  return Object.entries(state.roles || {})
    .map(([role, requiredSkills]) => {
      const normalizedRequired = (requiredSkills || []).map((skill) => String(skill).trim().toLowerCase());
      const matched = requiredSkills.filter((skill) => userSkills.includes(String(skill).trim().toLowerCase()));
      const missing = requiredSkills.filter((skill) => !userSkills.includes(String(skill).trim().toLowerCase()));
      const fit = normalizedRequired.length ? Math.round((matched.length / normalizedRequired.length) * 100) : 0;
      return {
        role,
        fit,
        matched,
        missing,
      };
    })
    .sort((a, b) => b.fit - a.fit);
}

function getCurrentCareerRole() {
  return state.selectedCareerRole || state.lastAnalysis?.role || "";
}

function renderAnalysisPage() {
  const resultsWrap = $("analysisResults");
  if (resultsWrap) {
    resultsWrap.classList.toggle("hidden", !state.analysisVisible || !state.lastAnalysis);
  }

  if (!state.lastAnalysis || !state.analysisVisible) {
    if ($("analysisStatus")) {
      $("analysisStatus").textContent = "No resume analyzed yet.";
    }

    if ($("adminShortcutWrap")) {
      $("adminShortcutWrap").classList.toggle("hidden", !state.currentUser?.isAdmin);
    }
    return;
  }

  const extracted = state.lastAnalysis.extracted || {};
  const extractedData = $("extractedData");
  if (extractedData) {
    const skills = cleanExtractedList(extracted.skills);
    const education = cleanExtractedList(extracted.education);
    const experience = cleanExtractedList(extracted.experience);
    const certifications = cleanExtractedList(extracted.certifications);
    extractedData.innerHTML = `
      <p><strong>Skills:</strong> ${skills.join(", ") || "-"}</p>
      <p><strong>Education:</strong> ${education.join(", ") || "-"}</p>
      <p><strong>Experience:</strong> ${experience.join(", ") || ""}</p>
      <p><strong>Certificates:</strong> ${certifications.join(", ") || ""}</p>
    `;
  }

  if ($("selectedRoleLabel")) $("selectedRoleLabel").textContent = state.lastAnalysis.role || "-";
  if ($("matchScore")) $("matchScore").textContent = `${state.lastAnalysis.matchPercentage || 0}%`;
  renderChips("matchedSkills", state.lastAnalysis.matchedSkills || [], "ok");
  renderChips("missingSkills", state.lastAnalysis.missingSkills || [], "warn");

  if ($("atsScore")) $("atsScore").textContent = `${state.lastAnalysis.ats?.score || 0} / 100`;
  if ($("atsSuggestions")) {
    $("atsSuggestions").innerHTML = (state.lastAnalysis.ats?.suggestions || []).map((item) => `<li>${item}</li>`).join("");
  }

  if ($("analysisStatus")) {
    $("analysisStatus").textContent = `Latest analysis ready for ${state.lastAnalysis.role}. Continue to the roadmap page for personalized guidance.`;
  }

  if ($("adminShortcutWrap")) {
    $("adminShortcutWrap").classList.toggle("hidden", !state.currentUser?.isAdmin);
  }
}

function renderRoadmapPage() {
  if (!hasActiveAnalysis()) {
    if ($("roadmap")) $("roadmap").innerHTML = "<li>No analysis found. Go to the Skill Extraction page first.</li>";
    if ($("summaryRole")) $("summaryRole").textContent = "-";
    if ($("matchScore")) $("matchScore").textContent = "0%";
    if ($("atsScore")) $("atsScore").textContent = "0 / 100";
    renderChips("missingSkills", [], "warn");
    if ($("atsSuggestions")) $("atsSuggestions").innerHTML = "";
    if ($("demandSkills")) $("demandSkills").innerHTML = "";
    return;
  }

  if ($("summaryRole")) $("summaryRole").textContent = state.lastAnalysis.role || "-";
  if ($("matchScore")) $("matchScore").textContent = `${state.lastAnalysis.matchPercentage || 0}%`;
  if ($("atsScore")) $("atsScore").textContent = `${state.lastAnalysis.ats?.score || 0} / 100`;

  if ($("roadmap")) {
    $("roadmap").innerHTML = (state.lastAnalysis.roadmap || []).map((item) => `<li>${item}</li>`).join("");
  }

  const skills = state.lastAnalysis.extracted?.skills || [];
  const userSkillsLower = skills.map((skill) => skill.toLowerCase());
  const demand = $("demandSkills");
  if (demand) {
    demand.innerHTML = "";
    (state.lastAnalysis.demandSkills || []).forEach((skill) => {
      const span = document.createElement("span");
      const hasSkill = userSkillsLower.includes(skill.toLowerCase());
      span.className = `chip ${hasSkill ? "ok" : "warn"}`;
      span.textContent = hasSkill ? `${skill} (You have it)` : skill;
      demand.appendChild(span);
    });
  }

  renderChips("missingSkills", state.lastAnalysis.missingSkills || [], "warn");
  if ($("atsSuggestions")) {
    $("atsSuggestions").innerHTML = (state.lastAnalysis.ats?.suggestions || []).map((item) => `<li>${item}</li>`).join("");
  }
}

function renderCareerPage() {
  if (!hasActiveAnalysis()) {
    const cards = $("careerCards");
    if (cards) {
      cards.innerHTML = '<div class="career-card"><h3>No recommendation available yet</h3><p>Analyze a resume first from the Skill Extraction page.</p></div>';
    }
    if ($("mockInterviewRole")) $("mockInterviewRole").innerHTML = "";
    if ($("selectedCareerRole")) $("selectedCareerRole").textContent = "-";
    if ($("selectedCareerFit")) $("selectedCareerFit").textContent = "0%";
    renderChips("careerMatchedSkills", [], "ok");
    renderChips("careerMissingSkills", [], "warn");
    if ($("summaryRole")) $("summaryRole").textContent = "-";
    if ($("matchScore")) $("matchScore").textContent = "0%";
    if ($("atsScore")) $("atsScore").textContent = "0 / 100";
    renderChips("missingSkills", [], "warn");
    if ($("atsSuggestions")) $("atsSuggestions").innerHTML = "";
    setMessage("speechMsg", "Analyze a resume first to enable voice playback.", true);
    setMessage("interviewMsg", "Analyze a resume first to enable mock interview Q&A.", true);
    renderInterviewFeedback("");
    return;
  }

  const careerOptions = getCareerOptions();
  const currentRole = getCurrentCareerRole() || careerOptions[0]?.role || state.lastAnalysis.role || "-";
  state.selectedCareerRole = currentRole;
  const selectedCareer = careerOptions.find((item) => item.role === currentRole) || {
    role: currentRole,
    fit: state.lastAnalysis.matchPercentage || 0,
    matched: state.lastAnalysis.matchedSkills || [],
    missing: state.lastAnalysis.missingSkills || [],
  };

  const cards = $("careerCards");
  if (cards) {
    cards.innerHTML = careerOptions
      .map((item) => {
        const description = careerDescriptions[item.role] || "Career path based on your extracted skills.";
        return `
          <article class="career-card ${item.role === currentRole ? "career-card-active" : ""}">
            <h3>${escapeHtml(item.role)}</h3>
            <p class="career-fit">${item.fit}% fit</p>
            <p>${escapeHtml(description)}</p>
            <button type="button" data-career-role="${escapeHtml(item.role)}">${item.role === currentRole ? "Selected" : "Choose Role"}</button>
          </article>
        `;
      })
      .join("");
  }

  if ($("mockInterviewRole")) {
    $("mockInterviewRole").innerHTML = careerOptions
      .map((item) => `<option value="${escapeHtml(item.role)}">${escapeHtml(item.role)}</option>`)
      .join("");
    $("mockInterviewRole").value = currentRole;
  }

  if ($("selectedCareerRole")) $("selectedCareerRole").textContent = currentRole || "-";
  if ($("selectedCareerFit")) $("selectedCareerFit").textContent = `${selectedCareer.fit || 0}%`;
  renderChips("careerMatchedSkills", selectedCareer.matched || [], "ok");
  renderChips("careerMissingSkills", selectedCareer.missing || [], "warn");
  if ($("summaryRole")) $("summaryRole").textContent = currentRole || "-";
  if ($("matchScore")) $("matchScore").textContent = `${selectedCareer.fit || 0}%`;
  if ($("atsScore")) $("atsScore").textContent = `${state.lastAnalysis.ats?.score || 0} / 100`;
  renderChips("missingSkills", selectedCareer.missing || [], "warn");
  if ($("atsSuggestions")) {
    $("atsSuggestions").innerHTML = (state.lastAnalysis.ats?.suggestions || []).map((item) => `<li>${item}</li>`).join("");
  }

  renderInterviewQA();
}

function buildCareerInterviewSpeech() {
  if (!hasActiveAnalysis()) return "";

  const role = getCurrentCareerRole() || "your selected role";
  const selectedCareer = getCareerOptions().find((item) => item.role === role);
  const fit = selectedCareer?.fit || state.lastAnalysis.matchPercentage || 0;
  const matched = (selectedCareer?.matched || state.lastAnalysis.matchedSkills || []).join(", ") || "no matched skills detected";
  const missing = (selectedCareer?.missing || state.lastAnalysis.missingSkills || []).join(", ") || "no missing skills";
  const currentQuestion = getInterviewQuestions()[state.interviewIndex] || "No interview question available yet.";

  return `Selected role ${role}. Career fit ${fit} percent. Matched skills: ${matched}. Missing skills: ${missing}. Current interview question: ${currentQuestion}`;
}

function getInterviewQuestions() {
  return state.lastAnalysis?.interviewQuestions || [];
}

function getInterviewFeedbackKey(question, role = getCurrentCareerRole()) {
  return `${role || "default"}::${question || ""}`;
}

function renderInterviewFeedback(question) {
  const card = $("interviewFeedbackCard");
  const statusEl = $("interviewFeedbackStatus");
  const answerEl = $("interviewCorrectAnswer");
  if (!card || !statusEl || !answerEl) return;

  const feedback = state.interviewFeedback[getInterviewFeedbackKey(question)];
  if (!feedback) {
    card.classList.add("hidden");
    statusEl.textContent = "";
    statusEl.className = "interview-feedback-status";
    answerEl.textContent = "";
    return;
  }

  card.classList.remove("hidden");
  statusEl.textContent = feedback.correct ? "AI Answer" : "Answer unavailable";
  statusEl.className = `interview-feedback-status ${feedback.correct ? "ok" : "warn"}`;
  answerEl.textContent = feedback.answer;
}

async function refreshInterviewQuestionsForRole(role = getCurrentCareerRole()) {
  if (!hasActiveAnalysis() || !role) return;

  try {
    const { questions } = await api(`/api/interview-questions/${encodeURIComponent(role)}`);
    state.lastAnalysis.interviewQuestions = questions || [];
    state.selectedCareerRole = role;
    state.interviewIndex = 0;
    localStorage.setItem(ANALYSIS_KEY, JSON.stringify(state.lastAnalysis));
  } catch {
    // Keep the latest analyzed questions as fallback if the refresh fails.
  }
}

function renderInterviewQA() {
  const questionEl = $("interviewQuestion");
  const answerEl = $("interviewAnswer");
  if (!questionEl || !answerEl) return;

  const questions = getInterviewQuestions();
  if (!questions.length) {
    questionEl.value = "";
    answerEl.value = "";
    renderInterviewFeedback("");
    return;
  }

  if (state.interviewIndex >= questions.length) {
    state.interviewIndex = 0;
  }

  const currentQuestion = questions[state.interviewIndex];
  questionEl.value = currentQuestion;
  answerEl.value = state.interviewAnswers[currentQuestion] || "";
  renderInterviewFeedback(currentQuestion);
  setMessage("interviewMsg", "");
}

function generateInterviewAnswer(question, role = getCurrentCareerRole()) {
  const normalizedQuestion = normalizeText(question);
  const roleName = role || "this role";
  if (!normalizedQuestion) return "";

  const answers = [
    {
      keywords: ["oop", "object oriented", "encapsulation", "inheritance", "polymorphism"],
      answer: "Object-oriented programming organizes software around objects that combine data and behavior. Its core principles are encapsulation, which protects an object's internal state; abstraction, which exposes only necessary details; inheritance, which lets a class reuse and extend behavior; and polymorphism, which lets different objects respond to the same interface in their own way. Together, these principles make code easier to reuse, test, and maintain.",
    },
    {
      keywords: ["strength", "tell me about yourself", "introduce yourself"],
      answer: `I am a motivated candidate preparing for a ${roleName} position. I enjoy breaking complex problems into clear steps, learning quickly, and working collaboratively. My strengths are communication, ownership, and using feedback to improve. I am looking for a role where I can apply those strengths while continuing to build practical experience.`,
    },
    {
      keywords: ["weakness", "challenge", "difficult"],
      answer: "One area I continue to improve is balancing speed with depth when solving a new problem. I address it by clarifying priorities early, time-boxing research, and sharing progress before going too far in one direction. This helps me stay efficient while still delivering reliable work.",
    },
    {
      keywords: ["why should we hire", "why do you want", "why are you interested"],
      answer: `You should consider me for this ${roleName} opportunity because I combine a strong willingness to learn with a structured approach to problem-solving. I communicate clearly, take ownership of my work, and focus on delivering results that support the team and its users.`,
    },
    {
      keywords: ["team", "conflict", "collaborate"],
      answer: "I approach teamwork by making goals, responsibilities, and communication clear. If a conflict arises, I listen to the other perspective, focus on the shared outcome, and use facts and respectful discussion to agree on the next step. I believe constructive feedback strengthens both the solution and the team.",
    },
  ];

  const matched = answers.find(({ keywords }) => keywords.some((keyword) => normalizedQuestion.includes(keyword)));
  if (matched) return matched.answer;

  return `For a ${roleName} interview, I would answer this by first stating a clear main point, then giving a relevant example, and finally explaining the result. A strong response should be specific, honest, and connected to the role. For this question, describe your approach, the tools or skills you used, and what you learned or achieved.`;
}

function normalizeText(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function validateInterviewAnswer(question, answer) {
  const normalizedAnswer = normalizeText(answer);
  if (!normalizedAnswer) {
    return {
      correct: false,
      message: "Enter an answer before validating.",
      answer: "",
    };
  }

  const model = interviewAnswerBank[question];
  if (!model) {
    return {
      correct: false,
      message: "No model answer is configured for this question yet.",
      answer: "",
    };
  }

  const matchedKeywords = model.keywords.filter((keyword) => normalizedAnswer.includes(normalizeText(keyword)));
  const correct = matchedKeywords.length >= Math.max(2, Math.ceil(model.keywords.length / 2));

  if (correct) {
    return {
      correct: true,
      message: "Correct answer selected. The model answer is shown below.",
      answer: model.answer,
    };
  }

  return {
    correct: false,
    message: "Wrong answer selected. The correct answer is shown below.",
    answer: model.answer,
  };
}

function getSpeechSupport() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function loadVoices() {
  const languageSelect = $("languageSelect");
  const voiceSelect = $("voiceSelect");
  if (!languageSelect || !voiceSelect) return;

  if (!getSpeechSupport()) {
    setMessage("speechMsg", "Voice playback is not supported in this browser.", true);
    return;
  }

  state.voices = window.speechSynthesis.getVoices();
  const currentLanguage = languageSelect.value;
  const selectedName = voiceSelect.value;
  const matching = state.voices.filter((voice) => voice.lang === currentLanguage || voice.lang.startsWith(`${currentLanguage.split("-")[0]}-`));

  voiceSelect.innerHTML = '<option value="">Default system voice</option>';
  matching.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  if (matching.some((voice) => voice.name === selectedName)) {
    voiceSelect.value = selectedName;
  }

  if (!matching.length) {
    setMessage("speechMsg", `No installed voices found for ${languageLabels[currentLanguage] || currentLanguage}. Using system default.`);
  } else {
    setMessage("speechMsg", "");
  }
}

function formatTitleCase(text) {
  return String(text || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderAdminDashboard(data) {
  if (!data) return;

  if ($("adminSessionText")) {
    $("adminSessionText").textContent = `Signed in as ${state.currentUser?.email || "administrator"}. You can manage roles, skills, resources, interview questions, trends, and user activity here.`;
  }

  if ($("roleCount")) $("roleCount").textContent = Object.keys(data.roles || {}).length;
  if ($("skillCount")) $("skillCount").textContent = (data.skillCatalog || []).length;
  if ($("courseCount")) $("courseCount").textContent = Object.keys(data.courseMap || {}).length;
  if ($("userCount")) $("userCount").textContent = (data.users || []).length;

  const roleSelect = $("questionRole");
  if (roleSelect) {
    const currentValue = roleSelect.value;
    roleSelect.innerHTML = Object.keys(data.roles || {})
      .map((role) => `<option value="${escapeHtml(role)}">${escapeHtml(role)}</option>`)
      .join("");
    if ([...roleSelect.options].some((option) => option.value === currentValue)) {
      roleSelect.value = currentValue;
    }
  }

  if ($("adminRoleList")) {
    $("adminRoleList").innerHTML = Object.entries(data.roles || {})
      .map(([role, skills]) => `
        <div class="admin-item">
          <div>
            <strong>${escapeHtml(role)}</strong>
            <p>${escapeHtml((skills || []).join(", "))}</p>
          </div>
          <div class="admin-actions">
            <button type="button" data-edit-role="${escapeHtml(role)}">Edit</button>
            <button type="button" class="danger-btn" data-delete-role="${escapeHtml(role)}">Delete</button>
          </div>
        </div>
      `)
      .join("");
  }

  if ($("skillCatalogList")) {
    $("skillCatalogList").innerHTML = (data.skillCatalog || [])
      .map((skill) => `
        <span class="chip">
          ${escapeHtml(formatTitleCase(skill))}
          <button type="button" class="chip-delete" data-delete-skill="${escapeHtml(skill)}">Remove</button>
        </span>
      `)
      .join("");
  }

  if ($("courseList")) {
    $("courseList").innerHTML = Object.entries(data.courseMap || {})
      .map(([skill, title]) => `
        <div class="admin-item">
          <div>
            <strong>${escapeHtml(skill)}</strong>
            <p>${escapeHtml(title)}</p>
          </div>
          <div class="admin-actions">
            <button type="button" data-edit-course="${escapeHtml(skill)}">Edit</button>
            <button type="button" class="danger-btn" data-delete-course="${escapeHtml(skill)}">Delete</button>
          </div>
        </div>
      `)
      .join("");
  }

  const selectedRole = $("questionRole")?.value || Object.keys(data.roles || {})[0] || "";
  if ($("questionList")) {
    const customQuestions = data.customInterviewQuestions?.[selectedRole] || [];
    $("questionList").innerHTML = (data.interviewQuestions?.[selectedRole] || [])
        .map((question) => `
          <div class="admin-item">
            <div>
              <strong>${escapeHtml(selectedRole)}</strong>
              <p>${escapeHtml(question)}</p>
            </div>
            <div class="admin-actions">
              ${customQuestions.includes(question) ? `<button type="button" class="danger-btn" data-delete-question="${escapeHtml(question)}">Delete</button>` : '<span class="feature-note">Default</span>'}
            </div>
          </div>
        `)
        .join("") || "<p>No interview questions for this role yet.</p>";
  }

    if ($("trendList")) {
      $("trendList").innerHTML = (data.trendSkills || [])
        .map((skill) => `
          <span class="chip">
            ${escapeHtml(skill)}
          <button type="button" class="chip-delete" data-delete-trend="${escapeHtml(skill)}">Remove</button>
        </span>
      `)
        .join("");
    }

    if ($("gdTopicList")) {
      $("gdTopicList").innerHTML = (data.gdTopics || [])
        .map((topic) => `
          <div class="admin-item">
            <div>
              <strong>${escapeHtml(topic.title)}</strong>
              <p>${escapeHtml(topic.prompt)}</p>
              <p>Difficulty: ${escapeHtml(topic.difficulty || "Medium")} | Time Limit: ${escapeHtml(String(topic.durationSeconds || data.gdConfig?.durationSeconds || 480))} sec</p>
            </div>
            <div class="admin-actions">
              <button type="button" data-edit-gd-topic="${escapeHtml(topic.id)}">Edit</button>
              <button type="button" class="danger-btn" data-delete-gd-topic="${escapeHtml(topic.id)}">Delete</button>
            </div>
          </div>
        `)
        .join("") || "<p>No GD topics added yet.</p>";
    }

    if ($("gdConfigDuration")) $("gdConfigDuration").value = String(data.gdConfig?.durationSeconds || 480);
    if ($("gdGrammarWeight")) $("gdGrammarWeight").value = String(data.gdConfig?.grammarWeight || 30);
    if ($("gdRelevanceWeight")) $("gdRelevanceWeight").value = String(data.gdConfig?.relevanceWeight || 50);
    if ($("gdConfidenceWeight")) $("gdConfidenceWeight").value = String(data.gdConfig?.confidenceWeight || 20);

    if ($("gdSessionList")) {
      $("gdSessionList").innerHTML = (data.gdSessions || [])
        .map((session) => `
          <div class="admin-item">
            <div>
              <strong>${escapeHtml(session.topicTitle || session.prompt || "GD Session")}</strong>
              <p>Difficulty: ${escapeHtml(session.difficulty || "Medium")} | Time Limit: ${escapeHtml(String(session.durationSeconds || data.gdConfig?.durationSeconds || 480))} sec</p>
              <p>Started: ${escapeHtml(new Date(session.startedAt).toLocaleString())}</p>
              <p>Responses: ${escapeHtml(String((session.responses || []).length))}</p>
            </div>
          </div>
        `)
        .join("") || "<p>No GD sessions available yet.</p>";
    }

    if ($("gdResponseList")) {
      const responseItems = (data.gdSessions || []).flatMap((session) =>
        (session.responses || []).map((response) => ({
          topicTitle: session.topicTitle || session.prompt || "GD Topic",
          at: response.at,
          text: response.text,
          feedback: response.feedback,
        }))
      );

      $("gdResponseList").innerHTML = responseItems
        .slice(0, 20)
        .map((item) => `
          <div class="admin-item">
            <div>
              <strong>${escapeHtml(item.topicTitle)}</strong>
              <p>${escapeHtml(item.text)}</p>
              <p>Score: ${escapeHtml(String(item.feedback?.score || 0))} | Grammar: ${escapeHtml(String(item.feedback?.grammar || 0))} | Relevance: ${escapeHtml(String(item.feedback?.relevance || 0))} | Confidence: ${escapeHtml(String(item.feedback?.confidence || 0))}</p>
              <p>${escapeHtml(item.at ? new Date(item.at).toLocaleString() : "")}</p>
            </div>
          </div>
        `)
        .join("") || "<p>No GD responses submitted yet.</p>";
    }

    const workshopConfig = data.resumeWorkshopConfig || {};
    if ($("resumeTemplateNames")) {
      $("resumeTemplateNames").value = (workshopConfig.templates || []).map((item) => item.name).join("\n");
    }
    if ($("sampleResumeTitles")) {
      $("sampleResumeTitles").value = (workshopConfig.sampleResumes || []).map((item) => item.title).join("\n");
    }
    if ($("resumeRequiredSections")) {
      $("resumeRequiredSections").value = (workshopConfig.requiredSections || []).join(", ");
    }
    if ($("resumeKeywordDatabase")) {
      $("resumeKeywordDatabase").value = (workshopConfig.keywordDatabase || []).join("\n");
    }
    if ($("resumeFormatWeight")) $("resumeFormatWeight").value = String(workshopConfig.scoringRules?.format ?? 20);
    if ($("resumeContentWeight")) $("resumeContentWeight").value = String(workshopConfig.scoringRules?.content ?? 50);
    if ($("resumeKeywordsWeight")) $("resumeKeywordsWeight").value = String(workshopConfig.scoringRules?.keywords ?? 30);

    if ($("resumeWorkshopAdminSummary")) {
      $("resumeWorkshopAdminSummary").innerHTML = `
        <div class="admin-item">
          <div>
            <strong>Templates</strong>
            <p>${escapeHtml((workshopConfig.templates || []).map((item) => item.name).join(", ") || "-")}</p>
          </div>
        </div>
        <div class="admin-item">
          <div>
            <strong>Sample Resumes</strong>
            <p>${escapeHtml((workshopConfig.sampleResumes || []).map((item) => item.title).join(", ") || "-")}</p>
          </div>
        </div>
        <div class="admin-item">
          <div>
            <strong>Required Sections</strong>
            <p>${escapeHtml((workshopConfig.requiredSections || []).join(", ") || "-")}</p>
          </div>
        </div>
        <div class="admin-item">
          <div>
            <strong>ATS Scoring Rules</strong>
            <p>Format ${escapeHtml(String(workshopConfig.scoringRules?.format ?? 20))}% | Content ${escapeHtml(String(workshopConfig.scoringRules?.content ?? 50))}% | Keywords ${escapeHtml(String(workshopConfig.scoringRules?.keywords ?? 30))}%</p>
          </div>
        </div>
      `;
    }

    if ($("softSkillsAdminModule")) {
      const currentModule = $("softSkillsAdminModule").value;
      $("softSkillsAdminModule").innerHTML = (data.softSkillsModules || [])
        .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`)
        .join("");
      if ([...$("softSkillsAdminModule").options].some((option) => option.value === currentModule)) {
        $("softSkillsAdminModule").value = currentModule;
      }
    }

    const selectedSoftModuleId = $("softSkillsAdminModule")?.value || data.softSkillsModules?.[0]?.id || "";
    const selectedSoftModule = (data.softSkillsModules || []).find((item) => item.id === selectedSoftModuleId) || data.softSkillsModules?.[0];
    if (selectedSoftModule) {
      if ($("softSkillsAdminTitle")) $("softSkillsAdminTitle").value = selectedSoftModule.title || "";
      if ($("softSkillsAdminOverview")) $("softSkillsAdminOverview").value = selectedSoftModule.overview || "";
      if ($("softSkillsAdminVideos")) $("softSkillsAdminVideos").value = (selectedSoftModule.videos || []).join("\n");
      if ($("softSkillsAdminNotes")) $("softSkillsAdminNotes").value = (selectedSoftModule.notes || []).join("\n");
      if ($("softSkillsAdminExercises")) {
        $("softSkillsAdminExercises").value = (selectedSoftModule.exercises || [])
          .map((item) => `${item.title} | ${item.prompt} | ${item.targetSeconds || 180}`)
          .join("\n");
      }
    }

    if ($("softSkillsProgressAdmin")) {
      const progressEntries = Object.entries(data.softSkillsProgress || {});
      $("softSkillsProgressAdmin").innerHTML = progressEntries
        .map(([userId, progress]) => {
          const user = (data.users || []).find((item) => item.id === userId);
          const attempts = progress.attempts || [];
          const latest = attempts[attempts.length - 1];
          return `
            <div class="admin-item">
              <div>
                <strong>${escapeHtml(user?.email || userId)}</strong>
                <p>Completed Modules: ${escapeHtml(String((progress.completedModules || []).length))}</p>
                <p>Total Scores Recorded: ${escapeHtml(String(attempts.length))}</p>
                <p>Completion Rate: ${escapeHtml(String(Math.round((((progress.completedModules || []).length) / Math.max(1, (data.softSkillsModules || []).length)) * 100)))}%</p>
                <p>Latest Score: ${escapeHtml(String(latest?.evaluation?.overall || 0))}</p>
              </div>
            </div>
          `;
        })
        .join("") || "<p>No soft skills progress recorded yet.</p>";
    }

    if ($("userActivityList")) {
      $("userActivityList").innerHTML = `
        <table class="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Analyses</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          ${(data.users || []).map((user) => `
            <tr>
              <td>${escapeHtml(user.email)}</td>
              <td>${user.isAdmin ? "Admin" : "User"}</td>
              <td>${user.analyses}</td>
              <td>${escapeHtml(new Date(user.createdAt).toLocaleDateString())}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }
}

async function loadAdminDashboard() {
  const data = await api("/api/admin/dashboard");
  renderAdminDashboard(data);
  return data;
}

function speakText(text) {
  if (!text.trim()) {
    setMessage("speechMsg", "There is no content to speak yet.", true);
    return;
  }

  if (!getSpeechSupport()) {
    setMessage("speechMsg", "Voice playback is not supported in this browser.", true);
    return;
  }

  const language = $("languageSelect")?.value || "en-US";
  const voiceName = $("voiceSelect")?.value || "";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;

  if (voiceName) {
    const voice = state.voices.find((item) => item.name === voiceName);
    if (voice) utterance.voice = voice;
  }

  utterance.onstart = () => setMessage("speechMsg", `Speaking in ${languageLabels[language] || language}.`);
  utterance.onend = () => setMessage("speechMsg", "Voice playback finished.");
  utterance.onerror = () => setMessage("speechMsg", "Unable to play selected voice.", true);

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function bindAuthPage() {
  $("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const selectedRole = $("loginRole")?.value || "user";
      const data = await api("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: $("logEmail").value.trim().toLowerCase(),
          password: $("logPass").value,
        }),
      });

      const actualRole = data.user?.isAdmin ? "admin" : "user";
      if (selectedRole !== actualRole) {
        throw new Error(`This account is registered as ${actualRole}. Please choose ${actualRole} to continue.`);
      }

      clearStoredAnalysis();
      state.token = data.token;
      state.currentUser = data.user;
      localStorage.setItem(TOKEN_KEY, data.token);
      window.location.href = data.user?.isAdmin ? "admin.html" : "analysis.html";
    } catch (err) {
      setMessage("authMsg", err.message, true);
    }
  });
}

function bindSignupPage() {
  $("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await api("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: $("regEmail").value.trim().toLowerCase(),
          password: $("regPass").value,
          role: $("regRole")?.value || "user",
        }),
      });

      setMessage("authMsg", "Registration successful. Redirecting to login...");
      $("registerForm").reset();
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    } catch (err) {
      setMessage("authMsg", err.message, true);
    }
  });
}

function bindAnalysisPage() {
  $("roleSelect")?.addEventListener("change", renderRoleSkills);

  $("resumeForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      const role = $("roleSelect").value;
      const file = $("resumeFile").files[0];
      const text = $("resumeText").value.trim();

      form.append("targetRole", role);
      if (text) form.append("resumeText", text);
      if (file) form.append("resume", file);

      const data = await api("/api/resume/analyze", {
        method: "POST",
        body: form,
      });

      storeAnalysis(data);
      state.analysisVisible = true;
      renderAnalysisPage();
      setMessage("resumeMsg", "Resume parsed and analyzed successfully.");
    } catch (err) {
      setMessage("resumeMsg", err.message, true);
    }
  });

  $("gotoRoadmapBtn")?.addEventListener("click", () => {
    window.location.href = "roadmap.html";
  });

  $("gotoAdminBtn")?.addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}

function bindRoadmapPage() {
  $("gotoCareerBtn")?.addEventListener("click", () => {
    window.location.href = "career.html";
  });
}

function bindCareerPage() {
  $("careerCards")?.addEventListener("click", async (e) => {
    const role = e.target.closest("[data-career-role]")?.dataset.careerRole;
    if (!role) return;

    await refreshInterviewQuestionsForRole(role);
    renderCareerPage();
    setMessage("interviewMsg", `Interview role changed to ${role}.`);
  });

  $("mockInterviewRole")?.addEventListener("change", async (e) => {
    const role = e.target.value;
    await refreshInterviewQuestionsForRole(role);
    renderCareerPage();
    setMessage("interviewMsg", `Interview role changed to ${role}.`);
  });

  $("voiceAssistBtn")?.addEventListener("click", () => {
    const text = buildCareerInterviewSpeech();
    if (!text) {
      setMessage("speechMsg", "Analyze a resume first to enable voice assistant.", true);
      return;
    }
    speakText(text);
  });

  $("stopSpeechBtn")?.addEventListener("click", () => {
    if (!getSpeechSupport()) {
      setMessage("speechMsg", "Voice playback is not supported in this browser.", true);
      return;
    }
    window.speechSynthesis.cancel();
    setMessage("speechMsg", "Voice playback stopped.");
  });

  $("validateAnswerBtn")?.addEventListener("click", () => {
    const currentQuestion = $("interviewQuestion")?.value.trim();
    if (!currentQuestion) {
      setMessage("interviewMsg", "Enter an interview question first.", true);
      return;
    }

    const answer = generateInterviewAnswer(currentQuestion);
    $("interviewAnswer").value = answer;
    state.interviewAnswers[currentQuestion] = answer;
    writeInterviewState();
    state.interviewFeedback[getInterviewFeedbackKey(currentQuestion)] = {
      correct: true,
      answer,
    };
    renderInterviewFeedback(currentQuestion);
    setMessage("interviewMsg", "AI answer generated.");
  });

  $("nextQuestionBtn")?.addEventListener("click", () => {
    const questions = getInterviewQuestions();
    if (!questions.length) {
      setMessage("interviewMsg", "No interview questions available.", true);
      return;
    }

    state.interviewIndex = (state.interviewIndex + 1) % questions.length;
    renderInterviewQA();
    setMessage("interviewMsg", `Moved to question ${state.interviewIndex + 1} of ${questions.length}.`);
  });
}

function bindGdPage() {
  $("joinGdBtn")?.addEventListener("click", async () => {
    const topicId = $("gdTopicSelect")?.value;
    if (!topicId) {
      setMessage("gdMsg", "Select a topic first.", true);
      return;
    }

    try {
      const { session } = await api("/api/gd/joinSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      state.gd.session = session;
      renderGdSession();
      startGdTimer();
      setMessage("gdMsg", "GD session started. Share your opening point.");
    } catch (err) {
      setMessage("gdMsg", err.message, true);
    }
  });

  $("gdSubmitBtn")?.addEventListener("click", async () => {
    const message = $("gdNotes")?.value.trim() || "";
    if (!state.gd.session?.id) {
      setMessage("gdMsg", "Join a GD session first.", true);
      return;
    }
    if (!message) {
      setMessage("gdMsg", "Enter your response before submitting.", true);
      return;
    }

    try {
      const { session, feedback } = await api("/api/gd/submitResponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.gd.session.id,
          message,
        }),
      });
      state.gd.session = session;
      $("gdNotes").value = "";
      renderGdSession();
      renderGdFeedback(feedback);
      setMessage("gdMsg", "Response submitted. Review your score and suggestions.");
    } catch (err) {
      setMessage("gdMsg", err.message, true);
    }
  });

  $("gdVoiceBtn")?.addEventListener("click", () => {
    const recognition = getSpeechRecognition();
    if (!recognition) {
      setMessage("gdMsg", "Voice input is not supported in this browser.", true);
      return;
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript || "").join(" ").trim();
      if ($("gdNotes")) {
        $("gdNotes").value = transcript;
      }
      setMessage("gdMsg", "Voice converted to text. Review and submit your response.");
    };
    recognition.onerror = () => setMessage("gdMsg", "Unable to capture voice input.", true);
    recognition.start();
  });
}

function splitResumeItems(text) {
  return String(text || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitProjectBlocks(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (!lines.length) {
        return null;
      }

      const [title, ...rest] = lines;
      return {
        title,
        description: rest.join(" "),
      };
    })
    .filter(Boolean);
}

function isResumePlaceholder(value) {
  const text = String(value || "").trim().toLowerCase();
  return !text
    || text.startsWith("no ")
    || text.includes("not clearly found")
    || /^(certificates?|certifications?|projects?|skills|education|experience|summary|profile)$/i.test(text);
}

function getWorkshopPrefillText(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => !isResumePlaceholder(item)).join("\n");
  }
  return isResumePlaceholder(value) ? "" : String(value || "").trim();
}

function cleanExtractedList(items) {
  return (items || [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => !isResumePlaceholder(item))
    .filter((item) => !/^(certificates?|certifications?|experience|education|skills|projects|summary|profile)$/i.test(item));
}

function formatProjectPrefill(value) {
  const lines = Array.isArray(value)
    ? value.filter((item) => !isResumePlaceholder(item)).map((item) => String(item).trim()).filter(Boolean)
    : String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);

  const blocks = [];
  let current = null;

  lines.forEach((line) => {
    const isLikelyTitle = !/[.!?]$/.test(line) && line.length <= 80;
    if (!current || isLikelyTitle) {
      if (current) {
        blocks.push(current);
      }
      current = { title: line, details: [] };
      return;
    }

    current.details.push(line);
  });

  if (current) {
    blocks.push(current);
  }

  return blocks
    .map((block) => [block.title, block.details.join(" ")].filter(Boolean).join("\n"))
    .join("\n\n");
}

function buildResumeSuggestions(data) {
  const suggestions = [];
  const role = state.lastAnalysis?.role || "";
  const roleKeywords = state.lastAnalysis?.missingSkills || [];
  const weakPhrases = [
    { weak: "worked on", improved: "Developed and delivered" },
    { weak: "responsible for", improved: "Led and executed" },
    { weak: "helped with", improved: "Contributed to and improved" },
  ];

  if (!data.summary || data.summary.length < 60) {
    suggestions.push("Write a stronger professional summary with your target role, top skills, and one measurable strength.");
  }

  weakPhrases.forEach((item) => {
    if (data.projects.toLowerCase().includes(item.weak) || data.experience.toLowerCase().includes(item.weak)) {
      suggestions.push(`Replace weak phrasing like "${item.weak}" with stronger wording such as "${item.improved}".`);
    }
  });

  if (!/\b\d+%|\b\d+\+?\s*(users|projects|clients|months|years)\b/i.test(`${data.projects} ${data.experience}`)) {
    suggestions.push("Add measurable results like percentages, user counts, or time saved.");
  }

  if (role && roleKeywords.length) {
    suggestions.push(`For ${role}, naturally include keywords like: ${roleKeywords.slice(0, 3).join(", ")}.`);
  }

  if (!/[.!?]$/.test((data.summary || "").trim())) {
    suggestions.push("End your summary with proper punctuation for cleaner grammar.");
  }

  return suggestions.length ? suggestions : ["Your resume draft looks strong. Keep role-specific keywords and measurable outcomes in every major section."];
}

function buildResumePreviewHtml(data, template) {
  const educationItems = splitResumeItems(data.education);
  const skillItems = splitResumeItems(data.skills);
  const projectItems = splitProjectBlocks(data.projects);
  const experienceItems = splitResumeItems(data.experience);
  const certificateItems = splitResumeItems(data.certificates);

  return `
    <div class="resume-sheet">
      <h1>${escapeHtml(data.name || "Your Name")}</h1>
      <p><strong>Target Role:</strong> ${escapeHtml(state.lastAnalysis?.role || "Not selected yet")}</p>
      <h2>Professional Summary</h2>
      <p>${escapeHtml(data.summary || "Add a short summary that highlights your role focus, experience, and strengths.")}</p>
      <h2>Education</h2>
      <ul>${educationItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>Add your education details.</li>"}</ul>
        <h2>Skills</h2>
        <ul>${skillItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>Add your core skills.</li>"}</ul>
        <h2>Projects</h2>
        <div class="resume-projects">${projectItems.map((item) => `
          <div class="resume-project-item">
            <p class="resume-project-title">${escapeHtml(item.title)}</p>
            <p class="resume-project-description">${escapeHtml(item.description || "Add the project description and impact.")}</p>
          </div>
        `).join("") || '<p>Add your best project and its impact.</p>'}</div>
        <h2>Experience</h2>
        <ul>${experienceItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>Add your work or internship experience.</li>"}</ul>
        <h2>Certificates</h2>
      <ul>${certificateItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>Add your relevant certifications.</li>"}</ul>
    </div>
  `;
}

function readResumeWorkshopForm() {
  return {
    template: $("resumeTemplate")?.value || "modern",
    name: $("resumeName")?.value.trim() || "",
    summary: $("resumeSummary")?.value.trim() || "",
    education: $("resumeEducation")?.value.trim() || "",
    skills: $("resumeSkillsInput")?.value.trim() || "",
    projects: $("resumeProjects")?.value.trim() || "",
    experience: $("resumeExperienceInput")?.value.trim() || "",
    certificates: $("resumeCertificates")?.value.trim() || "",
  };
}

function renderResumeWorkshop() {
  const roleLabel = $("resumeWorkshopRole");
  if (roleLabel) {
    roleLabel.textContent = hasActiveAnalysis() ? state.lastAnalysis.role : "No active analysis";
  }

  if (hasActiveAnalysis()) {
    if (!$("resumeName")?.value.trim()) {
      $("resumeName").value = getWorkshopPrefillText(state.lastAnalysis.extracted?.name);
    }
    if (!$("resumeSkillsInput")?.value.trim()) {
      $("resumeSkillsInput").value = getWorkshopPrefillText(state.lastAnalysis.extracted?.skills).replace(/\n/g, ", ");
    }
    if (!$("resumeEducation")?.value.trim()) {
      $("resumeEducation").value = getWorkshopPrefillText(state.lastAnalysis.extracted?.education);
    }
    if (!$("resumeProjects")?.value.trim()) {
      $("resumeProjects").value = formatProjectPrefill(state.lastAnalysis.extracted?.projects);
    }
    if (!$("resumeExperienceInput")?.value.trim()) {
      $("resumeExperienceInput").value = getWorkshopPrefillText(state.lastAnalysis.extracted?.experience);
    }
    if (!$("resumeCertificates")?.value.trim()) {
      $("resumeCertificates").value = getWorkshopPrefillText(state.lastAnalysis.extracted?.certifications);
    }
    if (!$("resumeSummary")?.value.trim()) {
      const summarySkills = (state.lastAnalysis.extracted?.skills || []).filter((skill) => !isResumePlaceholder(skill)).slice(0, 4);
      const skillText = summarySkills.length ? summarySkills.join(", ") : "relevant technical skills";
      $("resumeSummary").value = `Aspiring ${state.lastAnalysis.role} with strengths in ${skillText} and a focus on continuous learning.`;
    }
  }
}

function generateResumePreview() {
  const data = readResumeWorkshopForm();
  const preview = $("resumePreview");
  if (!preview) return;

  preview.className = `resume-preview template-${data.template}`;
  preview.innerHTML = buildResumePreviewHtml(data, data.template);

  const suggestions = buildResumeSuggestions(data);
  const suggestionsEl = $("resumeSuggestions");
  if (suggestionsEl) {
    suggestionsEl.innerHTML = suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  setMessage("resumeWorkshopMsg", "Resume preview generated successfully.");
}

function exportResumePdf() {
  const preview = $("resumePreview");
  if (!preview || preview.textContent.includes('Fill the form and click "Generate Resume Preview"')) {
    setMessage("resumeWorkshopMsg", "Generate the preview before exporting.", true);
    return;
  }

  const jsPdfLib = window.jspdf?.jsPDF;
  if (jsPdfLib) {
    const doc = new jsPdfLib({ unit: "pt", format: "a4" });
    const lines = doc.splitTextToSize(preview.innerText, 520);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(lines, 40, 50);
    doc.save("resume-workshop.pdf");
    setMessage("resumeWorkshopMsg", "PDF exported successfully.");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    setMessage("resumeWorkshopMsg", "Popup blocked. Allow popups to export the resume.", true);
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Resume Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { margin-bottom: 6px; }
          h2 { margin-top: 18px; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; }
        </style>
      </head>
      <body>${preview.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  setMessage("resumeWorkshopMsg", "Print dialog opened. Save as PDF from your browser.");
}

function bindResumeWorkshopPage() {
  renderResumeWorkshop();
  $("generateResumeBtn")?.addEventListener("click", generateResumePreview);
  $("exportResumeBtn")?.addEventListener("click", exportResumePdf);
  $("resumeTemplate")?.addEventListener("change", () => {
    const preview = $("resumePreview");
    if (preview && !preview.textContent.includes('Fill the form and click "Generate Resume Preview"')) {
      generateResumePreview();
    }
  });
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;
  if (!state.gd.recognition) {
    state.gd.recognition = new Recognition();
      state.gd.recognition.lang = "en-US";
      state.gd.recognition.interimResults = true;
      state.gd.recognition.continuous = true;
      state.gd.recognition.maxAlternatives = 1;
  }
  return state.gd.recognition;
}

async function loadGdTopics() {
  const { topics } = await api("/api/gd/getTopics");
  state.gd.topics = topics || [];
  const select = $("gdTopicSelect");
  if (!select) return;
  select.innerHTML = state.gd.topics
    .map((topic) => `<option value="${escapeHtml(topic.id)}">${escapeHtml(topic.title)} - ${escapeHtml(topic.prompt)}</option>`)
    .join("");
  updateGdTopicPreview();
}

function updateGdTopicPreview() {
  const select = $("gdTopicSelect");
  const topic = state.gd.topics.find((item) => item.id === select?.value);
  if ($("gdTopicText")) {
    $("gdTopicText").textContent = topic ? topic.prompt : "Choose a topic and join the GD session.";
  }
}

function renderGdSession() {
  const chat = $("gdChat");
  if (!chat) return;

  const session = state.gd.session;
  if (!session) {
    chat.innerHTML = '<p class="chat-empty">Join a session to start the discussion.</p>';
    $("gdNotes")?.setAttribute("disabled", "disabled");
    $("gdSubmitBtn")?.setAttribute("disabled", "disabled");
    $("gdVoiceBtn")?.setAttribute("disabled", "disabled");
    return;
  }

  chat.innerHTML = session.messages.map((message) => `
    <div class="chat-message ${escapeHtml(message.role)}">
      <span class="chat-speaker">${escapeHtml(message.speaker)}</span>
      <p>${escapeHtml(message.text)}</p>
    </div>
  `).join("");

  $("gdNotes")?.removeAttribute("disabled");
  $("gdSubmitBtn")?.removeAttribute("disabled");
  $("gdVoiceBtn")?.removeAttribute("disabled");
}

function startGdTimer() {
  stopGdTimer();
  const timerEl = $("gdTimer");
  if (!timerEl || !state.gd.session) return;

  const startedAt = new Date(state.gd.session.startedAt).getTime();
  const endAt = startedAt + state.gd.session.durationSeconds * 1000;

  const render = () => {
    const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
    const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
    const seconds = String(remaining % 60).padStart(2, "0");
    timerEl.textContent = `${minutes}:${seconds}`;
    if (remaining <= 0) {
      stopGdTimer();
      setMessage("gdMsg", "Session time finished. You can still review your feedback.");
      $("gdSubmitBtn")?.setAttribute("disabled", "disabled");
      $("gdVoiceBtn")?.setAttribute("disabled", "disabled");
    }
  };

  render();
  state.gd.timerId = setInterval(render, 1000);
}

function renderGdFeedback(feedback) {
  if (!feedback) return;
  if ($("gdScore")) $("gdScore").textContent = `${feedback.score} / 100`;
  if ($("gdGrammarScore")) $("gdGrammarScore").textContent = String(feedback.grammar);
  if ($("gdRelevanceScore")) $("gdRelevanceScore").textContent = String(feedback.relevance);
  if ($("gdSentiment")) $("gdSentiment").textContent = feedback.sentiment || "-";
  if ($("gdSuggestions")) {
    $("gdSuggestions").innerHTML = (feedback.suggestions || []).map((item) => `<li>${item}</li>`).join("") || "<li>No suggestions yet.</li>";
  }
  if ($("gdOutputText")) {
    $("gdOutputText").textContent = `Latest GD score: ${feedback.score}/100. Grammar ${feedback.grammar}/30, relevance ${feedback.relevance}/50, sentiment ${feedback.sentiment}.`;
  }
}

async function loadSoftSkillsContent() {
  const { modules, progress } = await api("/api/soft-skills/content");
  state.softSkills.modules = modules || [];
  state.softSkills.progress = progress || { completedModules: [], attempts: [] };
  state.softSkills.activeModuleId = state.softSkills.activeModuleId || state.softSkills.modules[0]?.id || "";
}

function getActiveSoftSkillModule() {
  return state.softSkills.modules.find((item) => item.id === state.softSkills.activeModuleId) || state.softSkills.modules[0] || null;
}

function getActiveSoftSkillActivity() {
  const moduleData = getActiveSoftSkillModule();
  const activityId = $("softSkillActivitySelect")?.value;
  return moduleData?.exercises?.find((item) => item.id === activityId) || moduleData?.exercises?.[0] || null;
}

function renderSoftSkillProgress() {
  const progress = state.softSkills.progress || { completedModules: [], attempts: [] };
  const totalModules = state.softSkills.modules.length || 1;
  const pct = Math.round(((progress.completedModules || []).length / totalModules) * 100);

  if ($("softSkillCompletedCount")) $("softSkillCompletedCount").textContent = String((progress.completedModules || []).length);
  if ($("softSkillAttemptCount")) $("softSkillAttemptCount").textContent = String((progress.attempts || []).length);
  if ($("softSkillProgressBar")) $("softSkillProgressBar").style.width = `${pct}%`;
  if ($("softSkillProgressText")) $("softSkillProgressText").textContent = `${pct}% completed`;

  const latestAttempt = progress.attempts?.[progress.attempts.length - 1];
  if ($("softSkillLatestModule")) $("softSkillLatestModule").textContent = latestAttempt?.moduleTitle || "-";

  const completedWrap = $("softSkillCompletedModules");
  if (completedWrap) {
    completedWrap.innerHTML = "";
    (progress.completedModules || []).forEach((moduleId) => {
      const moduleData = state.softSkills.modules.find((item) => item.id === moduleId);
      if (!moduleData) return;
      const chip = document.createElement("span");
      chip.className = "chip ok";
      chip.textContent = moduleData.title;
      completedWrap.appendChild(chip);
    });
  }
}

function renderSoftSkillEvaluation(evaluation) {
  if ($("softSkillClarityScore")) $("softSkillClarityScore").textContent = String(evaluation?.clarity || 0);
  if ($("softSkillToneScore")) $("softSkillToneScore").textContent = String(evaluation?.tone || 0);
  if ($("softSkillQualityScore")) $("softSkillQualityScore").textContent = String(evaluation?.quality || 0);
  if ($("softSkillOverallScore")) $("softSkillOverallScore").textContent = `${evaluation?.overall || 0} / 100`;
  if ($("softSkillSuggestions")) {
    $("softSkillSuggestions").innerHTML = (evaluation?.suggestions || ["Complete a practice activity to see suggestions."])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }
}

function renderSoftSkillModuleContent() {
  const moduleData = getActiveSoftSkillModule();
  if (!moduleData) return;

  if ($("softSkillOverview")) $("softSkillOverview").textContent = moduleData.overview;

  const videos = $("softSkillVideos");
  if (videos) {
    videos.innerHTML = moduleData.videos.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const notes = $("softSkillNotes");
  if (notes) {
    notes.innerHTML = moduleData.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const exercises = $("softSkillExercises");
  if (exercises) {
    exercises.innerHTML = moduleData.exercises.map((item) => `<li>${escapeHtml(item.title)}: ${escapeHtml(item.prompt)}</li>`).join("");
  }

  const activitySelect = $("softSkillActivitySelect");
  if (activitySelect) {
    activitySelect.innerHTML = moduleData.exercises
      .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`)
      .join("");
  }

  renderSoftSkillPrompt();
}

function renderSoftSkillPrompt() {
  const activity = getActiveSoftSkillActivity();
  if ($("softSkillPrompt")) $("softSkillPrompt").textContent = activity?.prompt || "Select an activity to begin.";
  if ($("softSkillTimerGoal")) $("softSkillTimerGoal").textContent = `${activity?.targetSeconds || 60} seconds`;
}

function renderSoftSkillsPage() {
  const cards = $("softSkillModuleCards");
  if (cards) {
    cards.innerHTML = state.softSkills.modules.map((item) => `
      <article class="card feature-card soft-skill-card ${item.id === state.softSkills.activeModuleId ? "soft-skill-card-active" : ""}" data-soft-module="${escapeHtml(item.id)}">
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.overview)}</p>
      </article>
    `).join("");
  }

  const moduleSelect = $("softSkillModuleSelect");
  if (moduleSelect) {
    moduleSelect.innerHTML = state.softSkills.modules
      .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`)
      .join("");
    moduleSelect.value = state.softSkills.activeModuleId;
  }

  renderSoftSkillModuleContent();
  renderSoftSkillProgress();
}

function startSoftSkillTimer() {
  stopSoftSkillTimer();
  const activity = getActiveSoftSkillActivity();
  const timerEl = $("softSkillTimer");
  state.softSkills.timerRemaining = activity?.targetSeconds || 60;

  const render = () => {
    const minutes = String(Math.floor(state.softSkills.timerRemaining / 60)).padStart(2, "0");
    const seconds = String(state.softSkills.timerRemaining % 60).padStart(2, "0");
    if (timerEl) timerEl.textContent = `${minutes}:${seconds}`;

      if (state.softSkills.timerRemaining <= 0) {
        stopSoftSkillTimer();
        setMessage("softSkillsMsg", "Practice timer complete. Review your answer and click Evaluate Response.");
        return;
      }

    state.softSkills.timerRemaining -= 1;
  };

  render();
  state.softSkills.timerId = setInterval(render, 1000);
}

function bindSoftSkillsPage() {
  renderSoftSkillsPage();

  $("softSkillModuleCards")?.addEventListener("click", (e) => {
    const moduleId = e.target.closest("[data-soft-module]")?.dataset.softModule;
    if (!moduleId) return;
    state.softSkills.activeModuleId = moduleId;
    renderSoftSkillsPage();
    setMessage("softSkillsMsg", "Module updated. Review the content and start a practice activity.");
  });

  $("softSkillModuleSelect")?.addEventListener("change", (e) => {
    state.softSkills.activeModuleId = e.target.value;
    renderSoftSkillsPage();
  });

  $("softSkillActivitySelect")?.addEventListener("change", () => {
    renderSoftSkillPrompt();
  });

  $("softSkillStartTimerBtn")?.addEventListener("click", () => {
    startSoftSkillTimer();
    setMessage("softSkillsMsg", "Practice timer started. You now have more than 1 minute to complete your response.");
  });

  $("softSkillVoiceBtn")?.addEventListener("click", () => {
    const recognition = getSpeechRecognition();
    if (!recognition) {
      setMessage("softSkillsMsg", "Voice input is not supported in this browser.", true);
      return;
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript || "").join(" ").trim();
      if ($("softSkillResponse")) {
        $("softSkillResponse").value = transcript;
      }
      setMessage("softSkillsMsg", "Voice converted to text. Review it and evaluate your response.");
    };
    recognition.onerror = () => setMessage("softSkillsMsg", "Unable to capture voice input.", true);
    recognition.start();
  });

  $("softSkillEvaluateBtn")?.addEventListener("click", async () => {
    const moduleData = getActiveSoftSkillModule();
    const activity = getActiveSoftSkillActivity();
    const response = $("softSkillResponse")?.value.trim() || "";

    if (!moduleData || !activity) {
      setMessage("softSkillsMsg", "Select a training section and activity first.", true);
      return;
    }

    if (!response) {
      setMessage("softSkillsMsg", "Enter or record your response before evaluation.", true);
      return;
    }

    try {
      const { evaluation, progress } = await api("/api/soft-skills/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: moduleData.id,
          activityId: activity.id,
          response,
        }),
      });

      state.softSkills.progress = progress || state.softSkills.progress;
      renderSoftSkillEvaluation(evaluation);
      renderSoftSkillProgress();
      setMessage("softSkillsMsg", `Evaluation complete. Overall score: ${evaluation.overall}/100.`);
    } catch (err) {
      setMessage("softSkillsMsg", err.message, true);
    }
  });
}

function bindAdminPage() {
  $("questionRole")?.addEventListener("change", () => {
    loadAdminDashboard().catch((err) => setMessage("adminMsg", err.message, true));
  });

  $("adminRoleForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const role = $("newRoleName").value.trim();
    const skills = $("newRoleSkills").value.split(",").map((item) => item.trim()).filter(Boolean);

    try {
      await api("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, skills }),
      });
      $("adminRoleForm").reset();
      await loadAdminDashboard();
      setMessage("adminMsg", `Role '${role}' saved successfully.`);
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("skillCatalogForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const skill = $("newSkillName").value.trim();

    try {
      await api("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill }),
      });
      $("skillCatalogForm").reset();
      await loadAdminDashboard();
      setMessage("adminMsg", `Skill '${skill}' added.`);
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("courseForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const skill = $("courseSkill").value.trim();
    const title = $("courseTitle").value.trim();

    try {
      await api("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, title }),
      });
      $("courseForm").reset();
      await loadAdminDashboard();
      setMessage("adminMsg", `Course for '${skill}' saved.`);
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("questionForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const role = $("questionRole").value;
    const question = $("questionText").value.trim();

    try {
      await api("/api/admin/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, question }),
      });
      $("questionForm").reset();
      await loadAdminDashboard();
      $("questionRole").value = role;
      setMessage("adminMsg", "Interview question saved.");
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("trendForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const skill = $("trendSkill").value.trim();

    try {
      await api("/api/admin/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill }),
      });
      $("trendForm").reset();
      await loadAdminDashboard();
      setMessage("adminMsg", `Trend '${skill}' added.`);
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
    });

  $("gdTopicForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await api("/api/admin/gd/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: $("gdTopicId").value.trim(),
          title: $("gdTopicTitle").value.trim(),
          difficulty: $("gdTopicDifficulty").value,
          prompt: $("gdTopicPrompt").value.trim(),
          durationSeconds: Number($("gdTopicDuration").value || 480),
        }),
      });
      $("gdTopicForm").reset();
      $("gdTopicId").value = "";
      $("gdTopicDifficulty").value = "Medium";
      await loadAdminDashboard();
      setMessage("adminMsg", "GD topic saved.");
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("gdConfigForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await api("/api/admin/gd/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationSeconds: Number($("gdConfigDuration").value || 480),
          grammarWeight: Number($("gdGrammarWeight").value || 30),
          relevanceWeight: Number($("gdRelevanceWeight").value || 50),
          confidenceWeight: Number($("gdConfidenceWeight").value || 20),
        }),
      });
      await loadAdminDashboard();
      setMessage("adminMsg", "GD feedback settings saved.");
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("resumeWorkshopAdminForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await api("/api/admin/resume-workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templates: ($("resumeTemplateNames").value || "")
            .split(/\r?\n/)
            .map((name, index) => ({ id: `template_${index + 1}`, name: name.trim() }))
            .filter((item) => item.name),
          sampleResumes: ($("sampleResumeTitles").value || "")
            .split(/\r?\n/)
            .map((title, index) => ({ id: `sample_${index + 1}`, title: title.trim() }))
            .filter((item) => item.title),
          requiredSections: ($("resumeRequiredSections").value || "").split(",").map((item) => item.trim()).filter(Boolean),
          keywordDatabase: ($("resumeKeywordDatabase").value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
          scoringRules: {
            format: Number($("resumeFormatWeight").value || 20),
            content: Number($("resumeContentWeight").value || 50),
            keywords: Number($("resumeKeywordsWeight").value || 30),
          },
        }),
      });
      await loadAdminDashboard();
      setMessage("adminMsg", "Resume workshop admin settings saved.");
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("softSkillsAdminModule")?.addEventListener("change", () => {
    loadAdminDashboard().catch((err) => setMessage("adminMsg", err.message, true));
  });

  $("softSkillsAdminForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const moduleId = $("softSkillsAdminModule").value;
      const exerciseLines = ($("softSkillsAdminExercises").value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
      const exercises = exerciseLines.map((line, index) => {
        const [title, prompt, seconds] = line.split("|").map((item) => item.trim());
        return {
          id: `${moduleId}_exercise_${index + 1}`,
          title,
          prompt,
          targetSeconds: Number(seconds || 180),
        };
      }).filter((item) => item.title && item.prompt);

      await api("/api/admin/soft-skills/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          title: $("softSkillsAdminTitle").value.trim(),
          overview: $("softSkillsAdminOverview").value.trim(),
          videos: ($("softSkillsAdminVideos").value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
          notes: ($("softSkillsAdminNotes").value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
          exercises,
        }),
      });
      await loadAdminDashboard();
      setMessage("adminMsg", "Soft skills training material saved.");
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("adminRoleList")?.addEventListener("click", async (e) => {
    const editRole = e.target.closest("[data-edit-role]")?.dataset.editRole;
    const deleteRole = e.target.closest("[data-delete-role]")?.dataset.deleteRole;

    try {
      if (editRole) {
        const data = await api("/api/admin/dashboard");
        $("newRoleName").value = editRole;
        $("newRoleSkills").value = (data.roles?.[editRole] || []).join(", ");
        return;
      }

      if (deleteRole) {
        await api(`/api/admin/roles/${encodeURIComponent(deleteRole)}`, { method: "DELETE" });
        await loadAdminDashboard();
        setMessage("adminMsg", `Role '${deleteRole}' deleted.`);
      }
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("skillCatalogList")?.addEventListener("click", async (e) => {
    const skill = e.target.closest("[data-delete-skill]")?.dataset.deleteSkill;
    if (!skill) return;

    try {
      await api(`/api/admin/skills/${encodeURIComponent(skill)}`, { method: "DELETE" });
      await loadAdminDashboard();
      setMessage("adminMsg", `Skill '${skill}' removed.`);
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("courseList")?.addEventListener("click", async (e) => {
    const editSkill = e.target.closest("[data-edit-course]")?.dataset.editCourse;
    const deleteSkill = e.target.closest("[data-delete-course]")?.dataset.deleteCourse;

    try {
      if (editSkill) {
        const data = await api("/api/admin/dashboard");
        $("courseSkill").value = editSkill;
        $("courseTitle").value = data.courseMap?.[editSkill] || "";
        return;
      }

      if (deleteSkill) {
        await api(`/api/admin/courses/${encodeURIComponent(deleteSkill)}`, { method: "DELETE" });
        await loadAdminDashboard();
        setMessage("adminMsg", `Course '${deleteSkill}' removed.`);
      }
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("questionList")?.addEventListener("click", async (e) => {
    const question = e.target.closest("[data-delete-question]")?.dataset.deleteQuestion;
    if (!question) return;

    try {
      await api("/api/admin/interview-questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: $("questionRole").value, question }),
      });
      await loadAdminDashboard();
      setMessage("adminMsg", "Interview question removed.");
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("trendList")?.addEventListener("click", async (e) => {
    const trend = e.target.closest("[data-delete-trend]")?.dataset.deleteTrend;
    if (!trend) return;

    try {
      await api(`/api/admin/trends/${encodeURIComponent(trend)}`, { method: "DELETE" });
      await loadAdminDashboard();
      setMessage("adminMsg", `Trend '${trend}' removed.`);
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });

  $("gdTopicList")?.addEventListener("click", async (e) => {
    const editId = e.target.closest("[data-edit-gd-topic]")?.dataset.editGdTopic;
    const deleteId = e.target.closest("[data-delete-gd-topic]")?.dataset.deleteGdTopic;

    try {
      if (editId) {
        const data = await api("/api/admin/dashboard");
        const topic = (data.gdTopics || []).find((item) => item.id === editId);
        if (!topic) return;
        $("gdTopicId").value = topic.id;
        $("gdTopicTitle").value = topic.title || "";
        $("gdTopicDifficulty").value = topic.difficulty || "Medium";
        $("gdTopicPrompt").value = topic.prompt || "";
        $("gdTopicDuration").value = String(topic.durationSeconds || data.gdConfig?.durationSeconds || 480);
        return;
      }

      if (deleteId) {
        await api(`/api/admin/gd/topics/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
        await loadAdminDashboard();
        setMessage("adminMsg", "GD topic deleted.");
      }
    } catch (err) {
      setMessage("adminMsg", err.message, true);
    }
  });
}

async function boot() {
  if (page === "auth") {
    bindAuthPage();
    return;
  }

  if (page === "signup") {
    bindSignupPage();
    return;
  }

  if (!ensureAuthenticated()) return;
  if (state.currentUser?.isAdmin && !isAdminManagementPage()) {
    window.location.href = "admin.html";
    return;
  }
  if (!state.currentUser?.isAdmin && isAdminManagementPage()) {
    window.location.href = "analysis.html";
    return;
  }
  updateAuthActions();

  try {
    if (isAdminManagementPage()) {
      await loadAdminDashboard();
    } else if (page === "gd") {
      await loadGdTopics();
    } else if (page === "soft-skills") {
      await loadSoftSkillsContent();
    } else {
      await loadRoles();
    }
  } catch {
    const messageId =
        page === "analysis" ? "resumeMsg"
          : isAdminManagementPage() ? "adminMsg"
            : page === "gd" ? "gdMsg"
                : page === "soft-skills" ? "softSkillsMsg"
                  : "speechMsg";
    setMessage(messageId, "Backend not running. Start backend server first.", true);
  }

  if (page === "analysis") {
    bindAnalysisPage();
    state.analysisVisible = false;
    renderAnalysisPage();
  }

  if (page === "roadmap") {
    bindRoadmapPage();
    renderRoadmapPage();
  }

  if (page === "career") {
    await refreshInterviewQuestionsForRole();
    bindCareerPage();
    renderCareerPage();
  }

  if (isAdminManagementPage()) {
    bindAdminPage();
  }

  if (page === "gd") {
    bindGdPage();
    $("gdTopicSelect")?.addEventListener("change", updateGdTopicPreview);
    renderGdSession();
  }

  if (page === "resume-workshop") {
    bindResumeWorkshopPage();
  }

  if (page === "soft-skills") {
    bindSoftSkillsPage();
  }
}

boot();
