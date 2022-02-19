DROP TABLE IF EXISTS tag_article;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tags;
CREATE TABLE users (
    username VARCHAR(25) NOT NULL,
    display_name VARCHAR(50),
    email VARCHAR(50),
    avatar VARCHAR(150),
    is_admin BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(username)
);
CREATE TABLE categories (
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    parent_category_id INT,
    PRIMARY KEY(id),
    INDEX(parent_category_id),
    FOREIGN KEY(parent_category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE TABLE articles (
    id INT AUTO_INCREMENT,
    title VARCHAR(150),
    cover VARCHAR(150),
    description VARCHAR(5000),
    content LONGTEXT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_draft BOOLEAN DEFAULT TRUE,
    owner_username VARCHAR(25),
    main_category_id INT,
    PRIMARY KEY(id),
    INDEX(owner_username),
    INDEX(main_category_id),
    FOREIGN KEY(owner_username) REFERENCES users(username) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY(main_category_id) REFERENCES categories(id) ON DELETE SET NULL
);
CREATE TABLE tags (
    id INT AUTO_INCREMENT,
    name VARCHAR(25),
    PRIMARY KEY(id)
);
CREATE TABLE tag_article (
    tag_id INT,
    article_id INT,
    INDEX(tag_id),
    INDEX(article_id),
    FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE
);