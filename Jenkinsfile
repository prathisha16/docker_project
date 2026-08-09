pipeline {

    agent any

    options {
        /*
         * Prevent Jenkins from automatically checking out SCM.
         */
        skipDefaultCheckout(true)

        /*
         * Prevent two builds from using the same workspace
         * at the same time.
         */
        disableConcurrentBuilds()
    }

    stages {

        /*
         * 1. Checkout
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
                    echo "FRONTEND DIRECTORY"
                    echo "======================================"

                    ls -la frontend

                    echo "======================================"
                    echo "API DIRECTORY"
                    echo "======================================"

                    ls -la api

                    echo "======================================"
                    echo "DATABASE DIRECTORY"
                    echo "======================================"

                    ls -la database

                    echo "======================================"
                    echo "DOCKER COMPOSE FILE"
                    echo "======================================"

                    ls -l docker-compose.yml

                    echo "======================================"
                    echo "GIT FRONTEND"
                    echo "======================================"

                    git ls-tree HEAD frontend

                    echo "======================================"
                    echo "CHECKOUT SUCCESSFUL"
                    echo "======================================"
                '''
            }
        }


        /*
         * 2. Validate Docker Compose
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
         * 3. Create Docker Secrets
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

                        echo "Docker secret files created successfully."

                        ls -la secrets
                    '''
                }
            }
        }


        /*
         * 4. Build Docker Images
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
                    ls -la frontend

                    echo ""
                    echo "API:"
                    ls -la api

                    echo ""
                    echo "Building Docker images..."

                    docker compose build
                '''
            }
        }


        /*
         * 5. Deploy application
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
         * 6. Verify containers
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
         * 7. Health Check
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
