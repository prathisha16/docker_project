pipeline {

    agent any

    stages {

        /*
         * 1. Clean workspace and get latest code from GitHub
         */
        stage('Checkout') {

            steps {

                echo 'Cleaning Jenkins workspace...'

                deleteDir()

                echo 'Checking out code from GitHub...'

                checkout scm

                echo 'Checking repository contents...'

                sh '''
                    echo "======================================"
                    echo "Current workspace:"
                    pwd

                    echo "======================================"
                    echo "Git commit:"
                    git rev-parse --short HEAD

                    echo "======================================"
                    echo "Git branch:"
                    git branch --show-current

                    echo "======================================"
                    echo "Repository contents:"
                    ls -la
                '''
            }
        }


        /*
         * 2. Verify required project directories
         */
        stage('Verify Project Structure') {

            steps {

                echo 'Verifying project structure...'

                sh '''
                    echo "Checking frontend directory..."
                    test -d frontend
                    ls -la frontend

                    echo "Checking API directory..."
                    test -d api
                    ls -la api

                    echo "Checking database directory..."
                    test -d database
                    ls -la database

                    echo "Checking Docker Compose file..."
                    test -f docker-compose.yml

                    echo "Checking Jenkinsfile..."
                    test -f Jenkinsfile

                    echo "Project structure verified successfully."
                '''
            }
        }


        /*
         * 3. Validate Docker Compose file
         */
        stage('Validate Docker Compose') {

            steps {

                echo 'Validating Docker Compose configuration...'

                sh '''
                    docker compose config
                '''
            }
        }


        /*
         * 4. Create Docker secrets
         *
         * Secrets are stored in Jenkins Credentials.
         * They are NOT stored in GitHub.
         */
        stage('Create Docker Secrets') {

            steps {

                withCredentials([

                    string(
                        credentialsId: 'mysql-root-password',
                        variable: 'MYSQL_ROOT_PASSWORD'
                    ),

                    string(
                        credentialsId: 'mysql-user',
                        variable: 'MYSQL_USER'
                    ),

                    string(
                        credentialsId: 'mysql-password',
                        variable: 'MYSQL_PASSWORD'
                    ),

                    string(
                        credentialsId: 'mysql-database',
                        variable: 'MYSQL_DATABASE'
                    )

                ]) {

                    sh '''
                        set +x

                        echo "Creating Docker secret files..."

                        mkdir -p secrets

                        printf '%s' "$MYSQL_ROOT_PASSWORD" \
                        > secrets/mysql_root_password

                        printf '%s' "$MYSQL_USER" \
                        > secrets/mysql_user

                        printf '%s' "$MYSQL_PASSWORD" \
                        > secrets/mysql_password

                        printf '%s' "$MYSQL_DATABASE" \
                        > secrets/mysql_database

                        chmod 600 secrets/*

                        echo "Docker secret files created successfully."
                    '''
                }
            }
        }


        /*
         * 5. Build Docker images
         */
        stage('Build Docker Images') {

            steps {

                echo 'Building Docker images...'

                sh '''
                    echo "Checking frontend before Docker build..."
                    ls -la frontend

                    echo "Checking API before Docker build..."
                    ls -la api

                    docker compose build
                '''
            }
        }


        /*
         * 6. Deploy application
         */
        stage('Deploy Docker Application') {

            steps {

                echo 'Starting Docker containers...'

                sh '''
                    docker compose up -d
                '''
            }
        }


        /*
         * 7. Check running containers
         */
        stage('Verify Containers') {

            steps {

                echo 'Checking Docker containers...'

                sh '''
                    docker compose ps
                '''
            }
        }


        /*
         * 8. Check API health
         */
        stage('Health Check') {

            steps {

                echo 'Checking API health...'

                sh '''
                    sleep 15

                    curl -f http://localhost:5000/health
                '''
            }
        }

    }


    /*
     * Pipeline result
     */
    post {

        success {

            echo '======================================'

            echo 'Docker application deployed successfully!'

            echo '======================================'

        }

        failure {

            echo '======================================'

            echo 'Docker deployment failed!'

            echo '======================================'

        }

    }

}
