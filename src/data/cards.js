// Project data
export const projects = [
  {
    id: 1,
    name: "Health-Aware School Meal Recommendations with Contextual Bandits (Under Review)",
    description: "This research paper proposes a contextual bandit approach to provide personalized, health-aware meal recommendations to students in Fairfax County Public Schools (FCPS). The paper proposes a LinUCB-based algorithm that considers both student preferences and nutritional guidelines to optimize meal selections over time.",
    image: "fcps.png",
    tags: ["AI/ML Systems", "Research & Publications"],
    github: "https://github.com/twallett/research",
    demo: null,
    website: null, 
    research: null
  },
  {
    id: 2,
    name: "Predicting Postoperative Complications in Laparoscopic General Surgery",
    description: "This research paper develops and evaluates machine learning and deep learning models to predict six critical postoperative complications: Cardiac Arrest, Myocardial Infarction, Pulmonary Embolism, Reintubation, Pneumonia, and Failure to Wean from Ventilator.",
    image: "postoperative.png",
    tags: ["AI/ML Systems", "Research & Publications"],
    github: "https://github.com/twallett/research",
    demo: null,
    website: null, 
    research: null
  },
  {
    id: 3,
    name: "A Benchmark for Graph-Based Dynamic Recommendation Systems",
    description: "This research paper aims to provide a comprehensive benchmarking framework for evaluating the performance of graph-based dynamic recommendation systems. Key algorithms covered SAGE (GraphSAGE), GAT (Graph Attention Networks), GIN (Graph Isomorphism Networks), and additional state of the art Graph Neural Network architectures.",
    image: "product-rec.png",
    tags: ["AI/ML Systems", "Research & Publications"],
    github: "https://github.com/twallett/research",
    demo: null,
    website: null, 
    research: "https://link.springer.com/article/10.1007/s00521-024-10425-6"
  },
  {
    id: 4,
    name: "DATS 6103: Data Mining",
    description: "This course introduces basic concepts of data mining as applied to Data Science, using Python as the programming language. Key algorithms covered include Linear/Logistic Regression (LR), Decision Trees (DT), Random Forests (RF), K-Nearest Neighbors (KNN), Support Vector Machines (SVM) and K-Means, with hands-on projects and real-world applications.",
    image: "dm-logo.png",
    tags: ["Data Mining", "AI/ML Systems", "Teaching & Courses"],
    github: null,
    demo: null,
    website: "https://dats.columbian.gwu.edu/courses/data-mining/", 
    research: null
  },
  {
    id: 5,
    name: "Math for Data Science",
    description: "This course introduces fundamental mathematical concepts for Data Science. Key subjects covered include Set Theory, Linear Algebra, Calculus and Probability, with real-world interview questions.",
    image: "gw-logo.png",
    tags: ["Teaching & Courses"],
    github: null,
    demo: null,
    website: "https://dats.columbian.gwu.edu/math", 
    research: null
  },
  {
    id: 6,
    name: "Programming for Data Science",
    description: "This course introduces fundamental programming concepts for Data Science. Key programming languages covered include Python, R and SQL, with real-world interview questions.",
    image: "gw-logo.png",
    tags: ["Teaching & Courses"],
    github: null,
    demo: null,
    website: "https://dats.columbian.gwu.edu/programming", 
    research: null
  },
  {
    id: 7,
    name: "DATS 6450: Reinforcement Learning",
    description:
      "This course introduces reinforcement learning through classical and deep architectures. Key algorithms covered include Monte Carlo (MC), Temporal Difference (TD), Value Function Approximation (VFA), Deep Q-Networks (DQN), Vanilla Policy Gradient (VPG), Proximal Policy Optimization (PPO), and Monte Carlo Tree Search (MCTS), with hands-on projects and real-world applications.",
    image: "rl-logo.png",
    tags: ["Reinforcement Learning", "AI/ML Systems", "Teaching & Courses"],
    github: null,
    demo: null,
    website: "https://twallett.com/courses/reinforcement-learning/", 
    research: null
  },
  // {
  //   id: 8,
  //   name: "Customer Segmentation",
  //   description: null,
  //   image: "segmentation.png",
  //   tags: ["AI/ML Systems"],
  //   github: null,
  //   demo: null
  // },
  // {
  //   id: 9,
  //   name: "High Engagement Layout",
  //   description: null,
  //   image: "layouts.png",
  //   tags: ["AI/ML Systems"],
  //   github: null,
  //   demo: null
  // },
  {
    id: 10,
    name: "Forecasting Financial and Economic Indicators",
    description: "This project applies deep learning techniques to forecast key financial and economic indicators, including corporate sales, unemployment rates, and more. Various architectures such as Multi-layered Perceptron (MLP), Recurrent Neural Networks (RNN), Long Short-Term Memory (LSTM), and Gated Recurrent Units (GRU) models are implemented and evaluated for their predictive performance.",
    image: "forecast.png",
    tags: ["AI/ML Systems"],
    github: "https://github.com/twallett/forecasting-deep-learning",
    demo: null,
    website: null,
    research: null
  },
  // {
  //   id: 11,
  //   name: "Product Association Discovery",
  //   description: null,
  //   image: "checkout.png",
  //   tags: ["AI/ML Systems"],
  //   github: null,
  //   demo: null
  // },
  // {
  //   id: 12,
  //   name: "Inventory Management",
  //   description: null,
  //   image: "inventory.png",
  //   tags: ["Reinforcement Learning", "AI/ML Systems"],
  //   github: null,
  //   demo: null
  // },
  // {
  //   id: 13,
  //   name: "Adaptive Product Promotion",
  //   description: null,
  //   image: "promotion.png",
  //   tags: ["AI/ML Systems"],
  //   github: null,
  //   demo: null
  // },
  {
    id: 14,
    name: "modrl",
    description: "A modular Python library for classical and deep Reinforcement Learning (RL).",
    image: "modrl.png",
    tags: ["Reinforcement Learning", "AI/ML Systems", "Open Source Projects"],
    github: "https://github.com/twallett/modrl",
    demo: null,
    website: null, 
    research: null
  },
  {
    id: 15,
    name: "Optimization Foundations",
    description: "This project applies optimization techniques using NumPy to optimize multidimensional functions. Key optimization algorithms covered include Gradient Descent, Linear Minimization, Newton's Method and Conjugate Gradient.",
    image: "optimization-foundations.gif",
    tags: ["Teaching & Courses"],
    github: "https://github.com/twallett/optimization-foundations",
    demo: null,
    website: null, 
    research: null
  },
  {
    id: 16,
    name: "Neural Network Foundations",
    description: "This project implements neural networks using NumPy to solve regression and classification problems. Key neural networks covered include Perceptron, ADALINE and Multi-Layered Perceptron (MLP).",
    image: "neural-network-foundations.gif",
    tags: ["AI/ML Systems", "Teaching & Courses"],
    github: "https://github.com/twallett/neural-network-foundations",
    demo: null,
    website: null, 
    research: null
  }
];
