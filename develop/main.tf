

locals {
  region           = "us-east-1"
  profile          = "kinsend"
  application_name = "kinsend-staging"
  environment      = "STAG"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  profile                 = local.profile
  region                  = local.region
#   shared_credentials_file = "~/.aws/credentials"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  version         = "3.13.0"
  name            = "${local.application_name}-${local.environment}"
  cidr            = "10.10.10.0/24"
  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.10.10.0/27", "10.10.10.32/27"]
  public_subnets  = ["10.10.10.96/27", "10.10.10.128/27"]


  default_security_group_name = "sg-${local.application_name}-${local.environment}"
  enable_nat_gateway          = true
  single_nat_gateway          = true // true if you want to provision a single shared NAT Gateway across all of your private networks
  # default_vpc_enable_dns_hostnames = true
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Environment = local.environment
    Owner       = "me"
  }
}

resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow SSH inbound traffic"
  vpc_id      = module.vpc.vpc_id
  egress = [
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 0
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "-1"
      security_groups  = []
      self             = false
      to_port          = 0
    }
  ]
  ingress = [
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 22
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = []
      self             = false
      to_port          = 22
    }
  ]
  tags = {
    Name = "allow_ssh"
  }
}



module "ec2_instance" {
  source                      = "terraform-aws-modules/ec2-instance/aws"
  version                     = "~> 3.0"
  associate_public_ip_address = true
  name                        = "demo-staging-instance"
  ami                         = "ami-0022f774911c1d690"
  instance_type               = "t2.small"
#   key_name                    = "kinsendbd-access-key-us-east-1"
  monitoring                  = true
  vpc_security_group_ids      = [aws_security_group.allow_ssh.id]
  subnet_id                   = module.vpc.public_subnets[0]
  # ebs_block_device = {
  #   device_name = "/dev/xvda"
  #   volume_size = 30
  # }
  root_block_device = [
    {
      # encrypted = true
      # volume_type = "gp2"
      # throughput  = 200
      volume_size = 30
      # tags = {
      #   Name = "my-root-block"
      # }
    },
  ]
  tags = {
    Terraform   = "true"
    Environment = "staging"
  }
}
