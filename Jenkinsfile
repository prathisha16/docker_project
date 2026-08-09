pipeline {

    agent any

    /*
     * Disable Jenkins automatic checkout.
     * We will perform one clean checkout ourselves.
     */
    options {
        skipDefaultCheckout(true)
    }

    stages {

        /*
         * 1. Clean workspace and checkout latest code
         */
        stage('Checkout') {

            steps {

                echo '======================================'
                echo 'Cleaning Jenkins workspace...'
                echo '======================================'

                deleteDir()

                echo 'Checking out code from GitHub...'

                checkout scm

                echo '======================================'
                echo 'Repository information'
                echo '======================================'

                sh '''
                    echo "Workspace:"
                    pwd

                    echo ""
                    echo "Git commit:"
                    git rev-parse --short HEAD

                    echo ""
                    echo "Repository contents:"
                    ls -la

                    echo ""
                    echo "Frontend directory:"
                    ls -la frontend

                    echo ""
                    echo "API directory:"
                    ls -la api

                    echo ""
                    echo "Database directory:"
                    ls -la database

                    echo ""
                    echo "Docker Compose file:"
                    ls -l docker-compose.yml
                '''
            }
        }


        /*
         * 2. Validate Docker Compose
         */
        stage('Validate Docker Compose') {

            steps {

                echo '======================================'
                echo 'Validating Docker Compose configuration'
                echo '======================================'

                sh '''
                    docker compose config
                '''
            }
        }


        /*
         * 3. Create Docker Secrets
         *
         * Secrets come from Jenkins Credentials.
         * They are not stored in GitHub.
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

                        echo ""
                        echo "Secret files:"
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
                echo 'Building Docker images...'
                echo '======================================'

                sh '''
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
                echo 'Starting Docker containers...'
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
                echo 'Checking Docker containers...'
                echo '======================================'

                sh '''
                    docker compose ps
                '''
            }
        }


        /*
         * 7. API Health Check
         */
        stage('Health Check') {

            steps {

                echo '======================================'
                echo 'Checking API health...'
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

    }

}
