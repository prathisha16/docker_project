pipeline {

    agent any

    /*
     * Prevent Jenkins from automatically checking out the repository.
     * We will perform the checkout ourselves.
     */
    options {
        skipDefaultCheckout(true)
    }

    stages {

        /*
         * 1. Clean workspace and checkout code
         */
        stage('Checkout') {

            steps {

                echo '======================================'
                echo 'Cleaning Jenkins workspace'
                echo '======================================'

                deleteDir()

                echo 'Checking out code from GitHub...'

                checkout scm

                sh '''
                    set -e

                    echo "======================================"
                    echo "CURRENT DIRECTORY"
                    echo "======================================"

                    pwd

                    echo "======================================"
                    echo "WORKSPACE"
                    echo "======================================"

                    echo "$WORKSPACE"

                    echo "======================================"
                    echo "GIT COMMIT"
                    echo "======================================"

                    git rev-parse --short HEAD

                    echo "======================================"
                    echo "REPOSITORY CONTENTS"
                    echo "======================================"

                    ls -la

                    echo "======================================"
                    echo "FRONTEND DETAILS"
                    echo "======================================"

                    ls -lad frontend || true

                    echo "======================================"
                    echo "FRONTEND STAT"
                    echo "======================================"

                    stat frontend || true

                    echo "======================================"
                    echo "SEARCHING FOR FRONTEND"
                    echo "======================================"

                    find . -maxdepth 3 -name "frontend" -print

                    echo "======================================"
                    echo "GIT TREE"
                    echo "======================================"

                    git ls-tree HEAD

                    echo "======================================"
                    echo "GIT FRONTEND TREE"
                    echo "======================================"

                    git ls-tree HEAD frontend || true

                    echo "======================================"
                    echo "GIT STATUS"
                    echo "======================================"

                    git status --short
                '''
            }
        }


        /*
         * 2. Verify project files
         */
        stage('Verify Project Structure') {

            steps {

                echo '======================================'
                echo 'Verifying project structure'
                echo '======================================'

                sh '''
                    set -e

                    echo "Workspace:"
                    pwd

                    echo ""
                    echo "Checking frontend..."

                    if [ -d "./frontend" ]; then
                        echo "Frontend directory exists."
                        ls -la ./frontend
                    else
                        echo "ERROR: frontend directory does not exist."
                        echo "Current directory contents:"
                        ls -la
                        exit 1
                    fi

                    echo ""
                    echo "Checking API..."

                    if [ -d "./api" ]; then
                        echo "API directory exists."
                        ls -la ./api
                    else
                        echo "ERROR: api directory does not exist."
                        exit 1
                    fi

                    echo ""
                    echo "Checking database..."

                    if [ -d "./database" ]; then
                        echo "Database directory exists."
                        ls -la ./database
                    else
                        echo "ERROR: database directory does not exist."
                        exit 1
                    fi

                    echo ""
                    echo "Checking docker-compose.yml..."

                    if [ -f "./docker-compose.yml" ]; then
                        echo "docker-compose.yml exists."
                        ls -l ./docker-compose.yml
                    else
                        echo "ERROR: docker-compose.yml does not exist."
                        exit 1
                    fi

                    echo ""
                    echo "Project structure verified successfully."
                '''
            }
        }


        /*
         * 3. Validate Docker Compose
         */
        stage('Validate Docker Compose') {

            steps {

                echo '======================================'
                echo 'Validating Docker Compose'
                echo '======================================'

                sh '''
                    docker compose config
                '''
            }
        }


        /*
         * 4. Create Docker secrets
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

                        echo "======================================"
                        echo "Creating Docker secret files"
                        echo "======================================"

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

                        echo "Docker secret files created."

                        ls -la secrets
                    '''
                }
            }
        }


        /*
         * 5. Build Docker images
         */
        stage('Build Docker Images') {

            steps {

                echo '======================================'
                echo 'Building Docker Images'
                echo '======================================'

                sh '''
                    set -e

                    echo "Current workspace:"
                    pwd

                    echo ""
                    echo "Frontend:"
                    ls -la ./frontend

                    echo ""
                    echo "API:"
                    ls -la ./api

                    echo ""
                    echo "Docker Compose build:"

                    docker compose build
                '''
            }
        }


        /*
         * 6. Deploy application
         */
        stage('Deploy Docker Application') {

            steps {

                echo '======================================'
                echo 'Starting Docker containers'
                echo '======================================'

                sh '''
                    docker compose up -d
                '''
            }
        }


        /*
         * 7. Verify containers
         */
        stage('Verify Containers') {

            steps {

                echo '======================================'
                echo 'Checking Docker containers'
                echo '======================================'

                sh '''
                    docker compose ps
                '''
            }
        }


        /*
         * 8. Health check
         */
        stage('Health Check') {

            steps {

                echo '======================================'
                echo 'Checking API health'
                echo '======================================'

                sh '''
                    echo "Waiting for application to start..."

                    sleep 15

                    echo "Checking API health..."

                    curl -f http://localhost:5000/health

                    echo ""
                    echo "API health check successful."
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

        always {

            echo '======================================'
            echo 'Pipeline completed'
            echo '======================================'
        }
    }
}
