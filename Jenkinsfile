pipeline {

    agent any

    stages {

        /*
         * 1. Get latest code from GitHub
         */
        stage('Checkout') {

            steps {

                echo 'Checking out code from GitHub...'

                checkout scm
            }
        }


        /*
         * 2. Validate Docker Compose file
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
         * 3. Create Docker secrets
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
                    '''
                }
            }
        }


        /*
         * 4. Build Docker images
         */
        stage('Build Docker Images') {

            steps {

                echo 'Building Docker images...'

                sh '''
                    docker compose build
                '''
            }
        }


        /*
         * 5. Deploy application
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
         * 6. Check running containers
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
         * 7. Check API health
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
