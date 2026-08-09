pipeline {

    agent any

    options {

        // Prevent Jenkins from automatically checking out the repository
        skipDefaultCheckout(true)

        // Prevent two builds of this job from running at the same time
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
                    echo "CURRENT WORKSPACE"
                    echo "======================================"

                    pwd

                    echo ""
                    echo "Build Number:"
                    echo "$BUILD_NUMBER"

                    echo ""
                    echo "Git Commit:"
                    git rev-parse --short HEAD

                    echo ""
                    echo "Repository Contents:"
                    ls -la

                    echo ""
                    echo "Frontend Directory:"
                    ls -la ./frontend

                    echo ""
                    echo "API Directory:"
                    ls -la ./api

                    echo ""
                    echo "Database Directory:"
                    ls -la ./database

                    echo ""
                    echo "Docker Compose:"
                    ls -l ./docker-compose.yml

                    echo ""
                    echo "Checkout completed successfully."
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

                echo '======================================'
                echo 'Creating Docker Secrets'
                echo '======================================'

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
                    ls -la ./frontend

                    echo ""
                    echo "API:"
                    ls -la ./api

                    echo ""
                    echo "Building Docker images..."

                    docker compose build
                '''
            }
        }


        /*
         * 5. Deploy Docker Application
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
         * 6. Verify Containers
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
                echo 'Checking API Health'
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
